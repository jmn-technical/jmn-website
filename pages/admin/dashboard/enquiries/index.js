import React, { useEffect, useState } from "react";
import AdminNav from "../../../../components/AdminNav";
import { Search, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

export default function Enquiries() {
  const [admissions, setAdmissions] = useState([]);
  const [filteredAdmissions, setFilteredAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [streamFilter, setStreamFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");
  const [availableYears, setAvailableYears] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const handleSidebarToggle = (event) => {
      setSidebarCollapsed(event.detail.collapsed);
    };

    window.addEventListener("sidebarToggle", handleSidebarToggle);
    return () =>
      window.removeEventListener("sidebarToggle", handleSidebarToggle);
  }, []);

  useEffect(() => {
    fetchAdmissions();
  }, []);

  useEffect(() => {
    filterData();
  }, [searchQuery, streamFilter, yearFilter, admissions]);

  const fetchAdmissions = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/getadmn");
      const data = await res.json();

      if (data.success) {
        const fetchedAdmissions = data.data || [];
        setAdmissions(fetchedAdmissions);

        // Extract unique years
        const years = [
          ...new Set(
            fetchedAdmissions.map((item) =>
              new Date(item.created_at).getFullYear().toString()
            )
          ),
        ]
          .sort()
          .reverse();
        setAvailableYears(["All", ...years]);
      }
    } catch (error) {
      console.error("Failed to fetch admissions", error);
    } finally {
      setLoading(false);
    }
  };

  const filterData = React.useCallback(() => {
    let result = admissions;

    // Filter by Stream
    if (streamFilter !== "All") {
      result = result.filter((item) => item.stream === streamFilter);
    }

    // Filter by Year
    if (yearFilter !== "All") {
      result = result.filter(
        (item) =>
          new Date(item.created_at).getFullYear().toString() === yearFilter
      );
    }

    // Filter by Search
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(lowerQuery) ||
          item.whatsapp.includes(lowerQuery)
      );
    }

    setFilteredAdmissions(result);
    setCurrentPage(1); // Reset to first page on filter change
  }, [admissions, streamFilter, yearFilter, searchQuery]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredAdmissions.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAdmissions.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleWhatsAppClick = (whatsapp) => {
    const cleanNumber = whatsapp.replace(/\D/g, "");
    window.open(`https://wa.me/${cleanNumber}`, "_blank");
  };

  const streams = ["All", "8", "+1", "Degree", "Rabbani"];

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />

      <main
        className={`transition-all duration-300 px-4 md:px-8 py-8 ${
          sidebarCollapsed ? "md:ml-0" : "md:ml-[280px]"
        }`}
      >
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Admission Enquiries
              </h1>
              <p className="text-gray-500 mt-1">
                Manage and track student applications
              </p>
            </div>
            {/* <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors">
              <Download size={18} /> Export CSV
            </button> */}
          </div>

          {/* Filters & Search */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row gap-4 justify-between">
            {/* Stream Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
              {streams.map((stream) => (
                <button
                  key={stream}
                  onClick={() => setStreamFilter(stream)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    streamFilter === stream
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {stream === "All" ? "All Streams" : stream}
                </button>
              ))}
            </div>

            {/* add a select option for year based filtering */}
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm font-medium text-gray-700"
            >
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year === "All" ? "All Years" : year}
                </option>
              ))}
            </select>
            {/* Search */}
            <div className="relative w-full md:w-72">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search by name or whatsapp..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-gray-500">Loading...</div>
            ) : filteredAdmissions.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                No admission enquiries found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold">
                      <th className="px-6 py-4">#</th>
                      <th className="px-6 py-4">Applicant Name</th>
                      <th className="px-6 py-4">WhatsApp</th>
                      <th className="px-6 py-4">Stream</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {currentItems.map((item, index) => (
                      <tr
                        key={item.id}
                        className="hover:bg-gray-50 hover:bg-opacity-50 transition-colors"
                      >
                        <td className="px-6 py-4 text-gray-400 text-sm">
                          {indexOfFirstItem + index + 1}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {item.name}
                        </td>
                        <td className="px-6 py-4 text-gray-600 font-mono text-sm">
                          {item.whatsapp}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              item.stream === "8"
                                ? "bg-purple-100 text-purple-800"
                                : item.stream === "+1"
                                ? "bg-blue-100 text-blue-800"
                                : item.stream === "Degree"
                                ? "bg-indigo-100 text-indigo-800"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {item.stream}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-500 text-sm">
                          {new Date(item.created_at).toLocaleDateString(
                            "en-IN",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleWhatsAppClick(item.whatsapp)}
                            className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                            title="Chat on WhatsApp"
                          >
                            <FaWhatsapp size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {!loading && filteredAdmissions.length > 0 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  Showing{" "}
                  <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
                  <span className="font-medium">
                    {Math.min(indexOfLastItem, filteredAdmissions.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium">
                    {filteredAdmissions.length}
                  </span>{" "}
                  results
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium ${
                          currentPage === page
                            ? "bg-blue-600 text-white"
                            : "border border-gray-300 hover:bg-gray-50 text-gray-700"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
