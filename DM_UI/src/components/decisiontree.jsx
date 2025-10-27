import React, { useEffect, useState } from "react";
import Tree from "react-d3-tree";
import { predict } from "./api";

export default function DecisionTreeChart() {
  const [treeData, setTreeData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTree = async () => {
      try {
        const result = await predict();
        console.log("Raw tree:", result);

        // ✅ Handle both object and array cases
        let tree = result?.decision_tree || result;
        if (Array.isArray(tree)) tree = tree[0];

        if (!tree) {
          console.error("No tree data found in response.");
          return;
        }

        // ✅ Rename keys recursively
        const renameKeys = (node) => {
          if (!node) return null;
          const newNode = { ...node };

          if (newNode.name) {
            newNode.name = newNode.name
              .replaceAll("Name_encoded", "Customers")
              .replaceAll("Item_encoded", "Item")
              .replaceAll("Type_encoded", "Type");
          }

          if (newNode.children) {
            newNode.children = newNode.children.map(renameKeys);
          }

          return newNode;
        };

        setTreeData([renameKeys(tree)]);
      } catch (error) {
        console.error("Unable to generate tree:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTree();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full w-full text-white">
        Loading decision tree...
      </div>
    );
  }

  if (!treeData) {
    return (
      <div className="flex items-center justify-center h-full w-full text-red-400">
        Failed to load tree data.
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-full w-full rounded-2xl bg-gray-500 p-4 overflow-hidden">
      <Tree
        data={treeData}
        zoomable={false}
        collapsible={false}
        draggable={false}
        translate={{ x: 250, y: 750 }}
        nodeSize={{ x: 200, y: 29 }}
        styles={{
          links: { stroke: "#ffffff", strokeWidth: 2 },
          nodes: {
            node: {
              name: { fill: "#ffffff", fontSize: "14px" },
              attributes: { fill: "#ffffff" },
            },
            leafNode: {
              name: { fill: "#ffffff", fontSize: "14px" },
              attributes: { fill: "#ffffff" },
            },
          },
        }}
      />
    </div>
  );
}
