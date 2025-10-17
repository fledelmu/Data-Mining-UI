from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from prophet import Prophet
from sklearn.tree import _tree
import json
import joblib
import os
import logging
import math
from pydantic import BaseModel


app = FastAPI()
logger = logging.getLogger(__name__)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or ["http://localhost:5173"] for stricter control
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ForecastRequest(BaseModel):
    store_name: str
    periods: int = 12

class NaNEncoder(json.JSONEncoder):
    def encode(self, o):
        if isinstance(o, float):
            if math.isnan(o) or math.isinf(o):
                return 'null'
        return super().encode(o)
    
    def iterencode(self, o, _one_shot=False):
        for chunk in super().iterencode(o, _one_shot):
            yield chunk

@app.get("/")
def health_check():
    return {"status": "Server running!"}

# Lazy loaders (only load when needed)
def load_data():
    path = "C:/Users/Asus/Documents/Programming Files/Data-Mining-UI/DM_BACKEND/data mining cleaned.xlsx - Sheet1.csv"
    return pd.read_csv(path)

def load_models():
    model_path = "C:/Users/Asus/Documents/Programming Files/Data-Mining-UI/DM_BACKEND/Data mining model"
    tree = joblib.load(os.path.join(model_path, "decision_tree_model.pkl"))
    le_type = joblib.load(os.path.join(model_path, "labelencoder_type.pkl"))
    le_name = joblib.load(os.path.join(model_path, "labelencoder_name.pkl"))
    le_item = joblib.load(os.path.join(model_path, "labelencoder_item.pkl"))
    return tree, le_type, le_name, le_item

def tree_to_json(decision_tree, feature_names, class_names):
    tree_ = decision_tree.tree_
    feature_name = [
        feature_names[i] if i != _tree.TREE_UNDEFINED else "undefined!"
        for i in tree_.feature
    ]

    def recurse(node):
        if tree_.feature[node] != _tree.TREE_UNDEFINED:
            name = feature_name[node]
            threshold = tree_.threshold[node]
            return {
                "name": f"{name} <= {threshold:.2f}",
                "children": [
                    recurse(tree_.children_left[node]),
                    recurse(tree_.children_right[node])
                ]
            }
        else:
            value = tree_.value[node][0]
            class_idx = value.argmax()
            return {
                "name": f"Predict: {class_names[class_idx]}"
            }

    return recurse(0)

@app.post("/predict/")
def decision_tree_endpoint():
    df = load_data()
    tree, le_type, le_name, le_item = load_models()

    # Preprocess
    df["Qty"] = pd.to_numeric(df["Qty"], errors="coerce")
    df["Sales Price"] = pd.to_numeric(df["Sales Price"].astype(str).str.replace(",", ""), errors="coerce")
    df["Amount"] = pd.to_numeric(df["Amount"].astype(str).str.replace(",", ""), errors="coerce")
    df = df.dropna(subset=["Qty", "Sales Price", "Amount"])

    # Encode
    df["Type_encoded"] = le_type.transform(df["Type"].astype(str))
    df["Name_encoded"] = le_name.transform(df["Name"].astype(str))
    df["Item_encoded"] = le_item.transform(df["Item"].astype(str))

    # Features
    X = df[["Qty", "Sales Price", "Amount", "Name_encoded", "Item_encoded"]]

    # Convert the decision tree to JSON
    tree_json = tree_to_json(tree, X.columns, le_type.classes_)

    return JSONResponse(content=[tree_json])

@app.post("/forecast/")
def forecast_endpoint(request : ForecastRequest):
    store_name = request.store_name
    periods = request.periods
    try:
        df = load_data()

        # --- Clean and parse data ---
        df = df.copy()
        df["Name"] = df["Name"].astype(str).str.strip()  # remove extra spaces
        df["Date"] = pd.to_datetime(df["Date"], errors="coerce")
        df["Amount"] = (
            df["Amount"]
            .astype(str)
            .str.replace(",", "")  # remove commas
            .str.strip()           # remove leading/trailing spaces
        )
        df["Amount"] = pd.to_numeric(df["Amount"], errors="coerce")

        # Drop rows with invalid data
        df = df.dropna(subset=["Name", "Date", "Amount"])

        # --- Aggregate monthly sales ---
        df['Month'] = df['Date'].dt.to_period('M')
        monthly_sales = (
            df.groupby(['Name', 'Month'])['Amount']
            .sum()
            .reset_index()
            .sort_values(['Name','Month'])
        )
        
        monthly_sales['ds'] = monthly_sales['Month'].dt.to_timestamp()
        monthly_sales['y'] = monthly_sales['Amount']

        store_name_clean = store_name.strip().lower()
        print(f"Store: {store_name}, months included:", monthly_sales[monthly_sales['Name'].str.lower() == store_name_clean]['Month'].astype(str).tolist())
        # --- Filter store (case-insensitive) ---
        store_name_clean = store_name.strip().lower()
        store_sales = monthly_sales[monthly_sales['Name'].str.lower() == store_name_clean][['ds','y']].copy()

        print(f"Store: {store_name}, months included:", store_sales['ds'].dt.strftime('%Y-%m').tolist())

        if store_sales.empty:
            available_names = monthly_sales['Name'].unique().tolist()
            return JSONResponse(
                {"error": f"No sales data found for store: {store_name}", "available_names": available_names},
                status_code=404
            )

        if len(store_sales) < 2:
            return JSONResponse({"error": f"Not enough data to forecast for store: {store_name}"}, status_code=400)

        # --- Train Prophet ---
        model = Prophet()
        model.fit(store_sales)

        # Forecast for future periods
        future = model.make_future_dataframe(periods=periods, freq='ME')
        forecast_df = model.predict(future)

        # Map actuals to forecast
        actuals_map = store_sales.set_index('ds')['y'].to_dict()
        forecast_df['y_actual'] = forecast_df['ds'].map(actuals_map)

        # Format dates
        forecast_df['ds'] = forecast_df['ds'].dt.strftime('%Y-%m-%d')

        # Clean NaN/Inf values
        records = forecast_df[['ds', 'yhat', 'yhat_lower', 'yhat_upper', 'y_actual']].to_dict(orient="records")
        cleaned_records = [
            {k: (v if not isinstance(v, float) or (not math.isnan(v) and not math.isinf(v)) else None)
             for k, v in record.items()}
            for record in records
        ]

        output = {"store": store_name, "forecast": cleaned_records}

        return JSONResponse(
            {"message": "Forecast completed successfully.", "result": output},
            media_type="application/json"
        )

    except Exception as e:
        logger.error(f"Forecast error: {str(e)}", exc_info=True)
        return JSONResponse({"error": str(e)}, status_code=500)



@app.post("/clustering/")
def scatter_plot():
    try:
        df = load_data()
        # --- Convert to numeric ---
        df["Qty"] = pd.to_numeric(df["Qty"], errors="coerce")
        df["Sales Price"] = pd.to_numeric(df["Sales Price"], errors="coerce")
        df["Amount"] = pd.to_numeric(df["Amount"], errors="coerce")
        df = df.dropna(subset=["Qty", "Sales Price", "Amount"])

        # --- Aggregate by customer ---
        customer_data = df.groupby("Name").agg({
            "Amount": "sum",
            "Qty": "sum",
            "Sales Price": "mean",
        }).reset_index()

        # --- Scale ---
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(customer_data[["Amount"]])

        # --- K-Means ---
        best_k = 10
        kmeans = KMeans(n_clusters=best_k, random_state=42, n_init=10)
        customer_data["Cluster_Sales"] = kmeans.fit_predict(X_scaled)

        # --- Cluster summary ---
        cluster_summary = customer_data.groupby("Cluster_Sales").mean(numeric_only=True)

        # --- Customers per cluster ---
        cluster_customers = (
            customer_data.groupby("Cluster_Sales")["Name"]
            .apply(list)
            .to_dict()
        )

        # --- Prepare output ---
        output = {
            "clusters": customer_data.to_dict(orient="records"),
            "summary": cluster_summary.to_dict(),
            "customers_per_cluster": cluster_customers  # ✅ new field
        }

        # Optional: save JSON
        pd.Series(output).to_json("cluster_output.json", indent=4)

        return JSONResponse(content=output)

    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)


    

@app.get("/names/")
def get_names():
    try:
        # Load the CSV
        df = load_data()
        
        # Drop rows without a Name
        df = df.dropna(subset=["Name"])
        
        # Get unique names
        unique_names = df["Name"].drop_duplicates().tolist()
        
        # Optionally, sort alphabetically
        unique_names.sort()
        
        # Return as JSON
        return JSONResponse({"names": unique_names})
    
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)
