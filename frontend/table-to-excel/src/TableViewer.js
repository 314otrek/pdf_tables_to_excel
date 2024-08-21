// TableViewer.js
import React, { useState } from 'react';
import axios from 'axios';

const TableViewer = () => {
    const [tables, setTables] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        const formData = new FormData();
        formData.append('file', file);

        await axios.post('http://127.0.0.1:5000/upload', formData);
        const response = await axios.get('http://127.0.0.1:5000/tables');
        setTables(response.data);
        setCurrentIndex(0);
    };

    const handleNext = () => {
        if (currentIndex < tables.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const handleDownload = async () => {
        const response = await axios.get(`http://127.0.0.1:5000/download`, {
            responseType: 'blob',
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `all_tables.xlsx`);
        document.body.appendChild(link);
        link.click();
    };

    return (
        <div className="App">
            <input type="file"  className= 'button-input'onChange={handleFileUpload} />
            {tables.length > 0 && (
                <div className="table-container">
                    <button onClick={handlePrevious} disabled={currentIndex === 0}>Previous</button>
                    <button onClick={handleNext} disabled={currentIndex === tables.length - 1}>Next</button>
                    <button onClick={handleDownload}>Download</button>
                    <table>
                        <thead>
                            <tr>
                                {tables[currentIndex][0].map((header, index) => (
                                    <th key={index}>{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {tables[currentIndex].slice(1).map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                    {row.map((cell, cellIndex) => (
                                        <td key={cellIndex}>{cell}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default TableViewer;