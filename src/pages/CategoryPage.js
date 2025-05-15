import React from "react";
import { useParams } from "react-router-dom";
import { BlockList } from "../components/Blocks";
import "../styles/CategoryPage.css";

const CategoryPage = () => {
const { categoryName } = useParams();

return (
    <div className="category-body">
        <h1 className="category-title">{categoryName}</h1>
        <div className="category-content">
        <BlockList category={categoryName} />
        </div>
    </div>
);
};

export default CategoryPage;