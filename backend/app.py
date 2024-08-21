from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import pdfplumber
import pandas as pd
import os

app = Flask(__name__)
CORS(app)

tables = []


# app.py
@app.route('/upload', methods=['POST'])
def upload_file():
    global tables
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    with pdfplumber.open(file) as pdf:
        tables = []
        for page in pdf.pages:
            page_tables = page.extract_tables()
            for table in page_tables:
                # Remove empty rows and columns
                cleaned_table = []
                for row in table:
                    cleaned_row = []
                    
                    for cell in row:
                        if cell is not None:
                            cell_str = str(cell)
                            if cell_str.strip():
                                cleaned_row.append(cell_str.strip())
                    
                    if cleaned_row:  # Only add non-empty rows
                        cleaned_table.append(cleaned_row)

                # Ensure all rows have the same number of columns
                if cleaned_table:
                    max_columns = max(len(row) for row in cleaned_table)
                    cleaned_table = [row + [''] * (max_columns - len(row)) for row in cleaned_table]
                    tables.append(cleaned_table)

    return jsonify({"message": "File processed", "table_count": len(tables)})


@app.route('/tables', methods=['GET'])
def get_tables():
    return jsonify(tables)

@app.route('/download', methods=['GET'])
def download_all_tables():
    if not tables:
        return jsonify({"error": "No tables available to download"}), 400

    # Create a Pandas Excel writer using Openpyxl
    with pd.ExcelWriter('all_tables.xlsx', engine='openpyxl') as writer:
        for index, table in enumerate(tables):
            df = pd.DataFrame(table)
            df.to_excel(writer, sheet_name=f'Table {index + 1}', index=False, header=False)

            # Add 5 empty rows after each table except the last one
            if index < len(tables) - 1:
                for _ in range(5):
                    writer.sheets[f'Table {index + 1}'].append([''] * len(df.columns))

    return send_file('all_tables.xlsx', as_attachment=True)

if __name__ == '__main__':
    app.run(debug=True)