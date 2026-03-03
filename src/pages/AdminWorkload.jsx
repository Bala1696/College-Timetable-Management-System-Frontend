import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { ChevronLeft, Users, UserCog, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

const WorkloadTable = ({ data, type }) => {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-gray-100">
                        <th className="p-4 font-semibold text-gray-600 text-sm">Name</th>
                        <th className="p-4 font-semibold text-gray-600 text-sm">Designation</th>
                        <th className="p-4 font-semibold text-gray-600 text-sm">Availability Matrix</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {data.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                            <td className="p-4 align-top w-1/4">
                                <div className="font-bold text-gray-900">{item.name}</div>
                                <div className="text-xs text-gray-500">{item.email}</div>
                            </td>
                            <td className="p-4 text-sm text-gray-700 align-top w-1/6">{item.designation}</td>
                            <td className="p-4">
                                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm max-w-2xl">
                                    <table className="w-full text-xs text-center">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-200 text-gray-500">
                                                <th className="py-2 px-3 text-left font-medium w-24">Day</th>
                                                {[1, 2, 3, 4, 5, 6, 7, 8].map(p => (
                                                    <th key={p} className="py-2 px-1 font-medium w-8">P{p}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {Object.entries(item.freeHours).map(([day, periods]) => (
                                                <tr key={day}>
                                                    <td className="py-1.5 px-3 text-left font-medium text-gray-600">{day}</td>
                                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(p => {
                                                        const isFree = periods.includes(p);
                                                        return (
                                                            <td key={p} className="py-1 px-1">
                                                                <div
                                                                    className={`mx-auto w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold transition-all ${isFree
                                                                        ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200'
                                                                        : 'bg-gray-50 text-gray-300'
                                                                        }`}
                                                                >
                                                                    {isFree ? p : '•'}
                                                                </div>
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {data.length === 0 && (
                        <tr>
                            <td colSpan="3" className="p-8 text-center text-gray-500">
                                No {type.toLowerCase()} found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

const AdminWorkload = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('faculty');
    const [filterSemester, setFilterSemester] = useState('All');
    const [filterSection, setFilterSection] = useState('All');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const endpoint = activeTab === 'faculty' ? '/workload/faculty' : '/workload/staff';
            const response = await api.get(endpoint);
            setData(response.data);
        } catch (error) {
            console.error('Error fetching workload:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#fafbfc] pb-24 pt-28 px-4 md:px-12 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-start gap-4">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="mt-1 p-2 bg-white hover:bg-gray-50 rounded-xl transition-all text-gray-400 hover:text-primary-600 shadow-sm border border-gray-100"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 font-display">Staff Workload & Availability</h1>
                            <p className="text-gray-500 mt-1">Monitor free hours and schedule distribution</p>
                        </div>
                    </div>
                </div>

                {/* Filters & Refresh */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    {/* Tabs */}
                    <div className="flex space-x-1 bg-gray-100/50 p-1 rounded-lg w-fit border border-gray-200">
                        <button
                            onClick={() => setActiveTab('faculty')}
                            className={`px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'faculty'
                                ? 'bg-white text-primary-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <Users className="w-4 h-4" />
                            Faculty
                        </button>
                        <button
                            onClick={() => setActiveTab('staff')}
                            className={`px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'staff'
                                ? 'bg-white text-purple-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <UserCog className="w-4 h-4" />
                            Supporting Staff
                        </button>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <select
                            value={filterSemester}
                            onChange={(e) => setFilterSemester(e.target.value)}
                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50/50 focus:ring-2 focus:ring-primary-500 outline-none"
                        >
                            <option value="All">All Semesters</option>
                            {['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'].map(s => (
                                <option key={s} value={s}>Semester {s}</option>
                            ))}
                        </select>
                        <select
                            value={filterSection}
                            onChange={(e) => setFilterSection(e.target.value)}
                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50/50 focus:ring-2 focus:ring-primary-500 outline-none"
                        >
                            <option value="All">All Sections</option>
                            <option value="A">Section A</option>
                            <option value="B">Section B</option>
                        </select>

                        <Button
                            onClick={fetchData}
                            variant="secondary"
                            className="px-3 py-2 border-gray-200 hover:bg-gray-50 text-gray-600"
                        >
                            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                    </div>
                </div>

                {/* Content */}
                <Card className="border-0 shadow-lg shadow-gray-200/50 ring-1 ring-gray-100">
                    {loading ? (
                        <div className="p-20 text-center">
                            <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                            <p className="text-gray-500 font-medium">Loading availability data...</p>
                        </div>
                    ) : (
                        <WorkloadTable
                            data={data.filter(item => {
                                if (filterSemester === 'All' && filterSection === 'All') return true;
                                const targetClass = `${filterSemester === 'All' ? '' : filterSemester}-${filterSection === 'All' ? '' : filterSection}`;
                                // If specific Sem-Sec (e.g. I-A)
                                if (filterSemester !== 'All' && filterSection !== 'All') {
                                    return item.teachingClasses?.includes(targetClass);
                                }
                                // If only Sem (e.g. I-?)
                                if (filterSemester !== 'All') {
                                    return item.teachingClasses?.some(c => c.startsWith(`${filterSemester}-`));
                                }
                                // If only Sec (e.g. ?-A)
                                if (filterSection !== 'All') {
                                    return item.teachingClasses?.some(c => c.endsWith(`-${filterSection}`));
                                }
                                return true;
                            })}
                            type={activeTab === 'faculty' ? 'Faculty' : 'Staff'}
                        />
                    )}
                </Card>
            </div>
        </div>
    );
};

export default AdminWorkload;
