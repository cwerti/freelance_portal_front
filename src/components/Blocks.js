import React from "react";
import img1 from '../images/img1.webp';
import img2 from '../images/img2.jpg';
import img3 from '../images/img3.jpg';
import "../styles/Home.css";


export const blocks = [
    {
        Nickname: 'ab ba',
        Price: '15 $',
        Rating: '4,5',
        img:  <img src={img1}  width={150} height={150} alt={"img1"}/>,
        Category: 'Дизайн'
    },
    {
        Nickname: "Raf ii",
        Price: '20$',
        Rating: '5',
        img: <img src={img2}  width={150} height={150} alt={"img2"}/>,
        Category: 'Программирование'
    },
    {
        Nickname: ' Jonh Wi',
        Price: '15$',
        Rating: '3,4',
        img: <img src={img3}  width={150} height={150} alt={"img3"}/>,
        Category: 'Маркетинг'
    }
]



export function BlockList({ category }) {
    const filteredBlocks = category 
    ? blocks.filter(block => block.Category === category)
    : blocks;

return (
    <div className="blocks-container">
        {filteredBlocks.map((block, index) => (
        <div key={index} className="block-item">
            {block.img}
            <h3>{block.Nickname}</h3>
            <p>Price: {block.Price}</p>
            <p>Rating: {block.Rating}</p>
            <p>Category: {block.Category}</p>
        </div>
        ))}
    </div>
    );
}