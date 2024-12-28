"use client";

import React, { useState, useEffect } from "react";
import { ChevronUp, ChevronDown, Search } from "lucide-react";


interface IRow {
  fullName: string;
  email: string;
  phone: string;
  customId: string;
  category: string;
  status: string;
  uuid: string;
}

const Admin = () => {
  const [rowData, setRowData] = useState<IRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState("Raw");
  const [filters, setFilters] = useState<{[key: string]: string}>({});
  const [sortConfig, setSortConfig] = useState<{
    key: keyof IRow | null;
    direction: 'asc' | 'desc' | null;
  }>({ key: null, direction: null });
  
  const [tabCounts, setTabCounts] = useState({
    Raw: 0,
    Interested: 0,
    FollowUp: 0,
    VisitScheduled: 0,
    Converted: 0,
    NotInterested: 0,
  });

  const columns = [
    { field: 'customId', headerName: 'Custom ID' },
    { field: 'fullName', headerName: 'Full Name' },
    { field: 'email', headerName: 'Email' },
    { field: 'phone', headerName: 'Phone' },
    { field: 'category', headerName: 'Category' },
    { field: 'status', headerName: 'Status' },
  ];

  useEffect(() => {
    fetchData(selectedTab);
    fetchTabCounts();
  }, [selectedTab]);

  const fetchTabCounts = async () => {
    const statuses = ["raw", "interested", "followUp", "visitScheduled", "converted", "notInterested"];
    const counts: { [key: string]: number } = {};

    for (const status of statuses) {
      try {
        const response = await fetch(`http://localhost:3002/form/count?status=${status}`);
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();
        counts[status] = data.count;
      } catch (error) {
        console.error(`Failed to fetch count for status ${status}:`, error);
      }
    }

    setTabCounts({
      Raw: counts.raw || 0,
      Interested: counts.interested || 0,
      FollowUp: counts.followUp || 0,
      VisitScheduled: counts.visitScheduled || 0,
      Converted: counts.converted || 0,
      NotInterested: counts.notInterested || 0,
    });
  };

  const fetchData = async (category: string) => {
    setLoading(true);
    const offset = 1;
    const pageSize = 10;
    const statusMap: { [key: string]: string } = {
      "Raw": "raw",
      "Interested": "interested",
      "FollowUp": "followUp",
      "Visit Scheduled": "visitScheduled",
      "Converted": "converted",
      "Not Interested": "notInterested"
    };
    
    const status = statusMap[category] || "raw";

    try {
      debugger;
      const response = await fetch(
        `http://localhost:3002/form/status?status=${status}&offset=${offset}&pageSize=${pageSize}`
      );
      if (!response.ok) throw new Error("Network response was not ok");
      
      const data = await response.json();
      const mappedData = data.data.map((item: any) => ({
        fullName: `${item.firstName} ${item.lastName}`,
        email: item.email,
        phone: item.mobileNumber,
        customId: item.customId,
        category: item.category,
        status: item.status,
        uuid: item.uuid,
      }));
      
      fetchTabCounts();
      setRowData(mappedData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateRecord = async (uuid: string, status: string) => {
    try {
      await fetch(
        `http://localhost:3002/form/updateStatus?uuid=${uuid}&status=${status}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ uuid, status }),
        }
      );
      fetchData(selectedTab);
    } catch (error) {
      console.error("Failed to update record:", error);
    }
  };

  const handleSort = (field: keyof IRow) => {
    let direction: 'asc' | 'desc' | null = 'asc';
    
    if (sortConfig.key === field && sortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (sortConfig.key === field && sortConfig.direction === 'desc') {
      direction = null;
    }
    
    setSortConfig({ key: field, direction });
  };

  const sortedData = [...rowData].sort((a, b) => {
    if (!sortConfig.key || !sortConfig.direction) return 0;
    
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (sortConfig.direction === 'asc') {
      return aValue < bValue ? -1 : 1;
    } else {
      return aValue > bValue ? -1 : 1;
    }
  });

  const filteredData = sortedData.filter(row => {
    return Object.entries(filters).every(([key, value]) => {
      return row[key as keyof IRow].toLowerCase().includes(value.toLowerCase());
    });
  });

  const StatusDropdown = ({ currentStatus, uuid }: { currentStatus: string; uuid: string }) => {
    const options = [
      "raw",
      "interested",
      "followUp",
      "visitScheduled",
      "converted",
      "notInterested",
    ];

  
    const [status, setStatus] = useState(currentStatus);


    useEffect(() => {
      setStatus(currentStatus);
    }, [currentStatus]);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newStatus = e.target.value;
      setStatus(newStatus);
      updateRecord(uuid, newStatus);
    };

    return (
      <select
        className="p-2 border rounded-md"
        value={status}
        onChange={handleChange}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  };

  return (

    <div className="flex justify-center items-center min-h-screen p-4">
      <div className="w-full max-w-6xl">
        <div className="mb-6 flex flex-wrap gap-2">
          {[
            "Raw",
            "Interested",
            "FollowUp",
            "Visit Scheduled",
            "Converted",
            "Not Interested",
          ].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-4 py-2 rounded-md text-white transition-all duration-300 ${
                selectedTab === tab
                  ? "bg-blue-600"
                  : "bg-gray-400 hover:bg-gray-500"
              }`}
            >
              {tab} ({tabCounts[tab.replace(" ", "") as keyof typeof tabCounts]})
            </button>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto w-full h-96">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  {columns.map((column) => (
                    <th key={column.field} className="p-4">
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center justify-between">
                          <span>{column.headerName}</span>
                          <button 
                            onClick={() => handleSort(column.field as keyof IRow)}
                            className="ml-2"
                          >
                            {sortConfig.key === column.field ? (
                              sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                            ) : (
                              <div className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        <input
                          type="text"
                          placeholder="Filter..."
                          className="p-1 text-sm border rounded"
                          onChange={(e) => setFilters(prev => ({
                            ...prev,
                            [column.field]: e.target.value
                          }))}
                        />
                      </div>
                    </th>
                  ))}
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-4">
                      Loading...
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-4">
                      No data found
                    </td>
                  </tr>
                ) : (
                  filteredData.map((row, index) => (
                    <tr 
                      key={row.uuid}
                      className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-gray-100`}
                    >
                      {columns.map((column) => (
                        <td key={column.field} className="p-4">
                          {row[column.field as keyof IRow]}
                        </td>
                      ))}
                      <td className="p-4">
                        <StatusDropdown currentStatus={row.status} uuid={row.uuid} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;