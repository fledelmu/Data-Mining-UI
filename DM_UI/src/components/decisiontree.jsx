import Tree from "react-d3-tree";

const data = {
  name: "Type Prediction Tree",
  children: [
    {
      name: "Is Qty > 50?",
      children: [
        {
          name: "Yes",
          children: [
            {
              name: "Is Amount > 5000?",
              children: [
                { name: "Yes → Type: Harvest" },
                { name: "No → Type: Supply" },
              ],
            },
          ],
        },
        {
          name: "No",
          children: [
            {
              name: "Is Sales Price > 100?",
              children: [
                { name: "Yes → Type: Harvest" },
                { name: "No → Type: Supply" },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export default function DecisionTreeChart() {
  return (
    <div className="flex items-center justify-center h-full w-full rounded-2xl bg-gray-500 p-4 overflow-hidden">
      <Tree
        data={data}
        zoomable={false}
        collapsible={false}
        draggable={false}
        translate={{ x: 350, y: 250 }}
        nodeSize={{ x: 200, y: 100 }}
        styles={{
          links: {
            stroke: "#ffffff", // white lines
            strokeWidth: 2,
          },
          nodes: {
            node: {
              name: { fill: "#ffffff", fontSize: "14px" }, // white text
              attributes: { fill: "#ffffff" },
            },
            leafNode: {
              name: { fill: "#ffffff", fontSize: "14px" }, // white text for leaves
              attributes: { fill: "#ffffff" },
            },
          },
        }}
      />
    </div>
  );
}
