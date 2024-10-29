import React from "react";

// Define a type for columns with specific key constraints
interface Column<T> {
    header: string;
    accessor: keyof T; // Use keyof T to ensure accessor is a key of T
}

// Define the props for the Table component
interface TableProps<T> {
    data: T[];
    columns: Column<T>[];
}

// Create the Table component
const Table = <T extends object>({ data, columns }: TableProps<T>) => {
    return (
        <div className="flex-1 min-w-[70%] max-h-[calc(100vh-100px)] overflow-y-auto">
            <table className="min-w-full bg-white border border-gray-200">
                <thead>
                    <tr className="bg-gray-100 border-b border-gray-200">
                        {columns.map((col, index) => (
                            <th
                                key={index}
                                className="py-2 px-4 text-left text-gray-700 font-semibold"
                            >
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, rowIndex) => (
                        <tr key={rowIndex} className="border-b border-gray-200">
                            {columns.map((col, colIndex) => (
                                <td
                                    key={colIndex}
                                    className="py-2 px-4 text-gray-900"
                                >
                                    {String(row[col.accessor])}{" "}
                                    {/* Convert content to string */}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Table;
