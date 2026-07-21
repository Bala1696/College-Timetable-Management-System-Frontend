import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const DEPARTMENTS = [
    'Electrical and Electronics Engineering',
    'Civil Engineering',
    'Computer Science Engineering',
    'Mechanical Engineering',
    'Artificial Intelligence and Data Science',
];

const DEPT_CODES = {
    'Electrical and Electronics Engineering': 'EEE',
    'Civil Engineering': 'CE',
    'Computer Science Engineering': 'CSE',
    'Mechanical Engineering': 'ME',
    'Artificial Intelligence and Data Science': 'AIDS',
};

const DEPT_ICONS = {
    'EEE': '⚡',
    'CE': '🏗️',
    'CSE': '💻',
    'ME': '⚙️',
    'AIDS': '🤖',
};

export default function SuperadminDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [stats, setStats] = useState(null);
    const [departments, setDepartments] = useState([]);
    const [admins, setAdmins] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');

    // Department form
    const [deptForm, setDeptForm] = useState({ id: null, name: '', code: '' });
    const [deptMsg, setDeptMsg] = useState('');

    // Admin form
    const [adminForm, setAdminForm] = useState({ id: null, username: '', email: '', password: '', departmentId: '' });
    const [adminMsg, setAdminMsg] = useState('');

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        if (!user || user.role !== 'superadmin') {
            navigate('/dashboard');
            return;
        }
        fetchAll();
    }, [user]);

    const fetchAll = async () => {
        try {
            const [statsRes, deptsRes, adminsRes] = await Promise.all([
                api.get('/admin/superadmin/stats', { headers }),
                api.get('/departments', { headers }),
                api.get('/departments/admins', { headers }),
            ]);
            setStats(statsRes.data);
            setDepartments(deptsRes.data);
            setAdmins(adminsRes.data);
        } catch (e) {
            console.error(e);
        }
    };

    const createOrUpdateDepartment = async (e) => {
        e.preventDefault();
        try {
            if (deptForm.id) {
                await api.put(`/departments/${deptForm.id}`, deptForm, { headers });
                setDeptMsg('✅ Department updated successfully!');
            } else {
                await api.post('/departments', deptForm, { headers });
                setDeptMsg('✅ Department created successfully!');
            }
            setDeptForm({ id: null, name: '', code: '' });
            fetchAll();
        } catch (err) {
            setDeptMsg('❌ ' + (err.response?.data?.message || 'Error saving department'));
        }
    };

    const deleteDepartment = async (id) => {
        if (!window.confirm('Are you sure you want to delete this department? This may affect assigned admins and faculty.')) return;
        try {
            await api.delete(`/departments/${id}`, { headers });
            fetchAll();
        } catch (err) {
            alert('❌ ' + (err.response?.data?.message || 'Error deleting department'));
        }
    };

    const createOrUpdateAdmin = async (e) => {
        e.preventDefault();
        try {
            if (adminForm.id) {
                await api.put(`/departments/admin/${adminForm.id}`, adminForm, { headers });
                setAdminMsg('✅ Admin updated successfully!');
            } else {
                await api.post('/departments/admin', adminForm, { headers });
                setAdminMsg('✅ Admin created successfully!');
            }
            setAdminForm({ id: null, username: '', email: '', password: '', departmentId: '' });
            fetchAll();
        } catch (err) {
            setAdminMsg('❌ ' + (err.response?.data?.message || 'Error saving admin'));
        }
    };

    const deleteAdmin = async (id) => {
        if (!window.confirm('Are you sure you want to delete this admin?')) return;
        try {
            await api.delete(`/departments/admin/${id}`, { headers });
            fetchAll();
        } catch (err) {
            alert('❌ ' + (err.response?.data?.message || 'Error deleting admin'));
        }
    };

    const handleAutofillDept = (name) => {
        setDeptForm({ ...deptForm, name, code: DEPT_CODES[name] || '' });
    };

    const getAdminsForDept = (deptId) => admins.filter(a => a.departmentId === deptId);

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            {/* Header */}
            <header className="bg-gray-900 border-b border-purple-800/40 px-6 py-4 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-xl font-bold shadow">S</div>
                    <div>
                        <h1 className="text-xl font-bold text-white">Superadmin Dashboard</h1>
                        <p className="text-xs text-purple-300">College Timetable System — Full Access</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-400">Logged in as <span className="text-purple-300 font-semibold">{user?.username}</span></span>
                    <button
                        onClick={() => { logout(); navigate('/login'); }}
                        className="px-4 py-2 bg-red-600/20 border border-red-500/30 text-red-400 rounded-lg text-sm hover:bg-red-600/30 transition"
                    >
                        Logout
                    </button>
                </div>
            </header>

            {/* Tabs */}
            <nav className="bg-gray-900/60 border-b border-gray-800 px-6 flex gap-2 pt-2">
                {[
                    { key: 'overview', label: '📊 Overview' },
                    { key: 'departments', label: '🏛️ Departments' },
                    { key: 'admins', label: '👤 Admins' },
                    { key: 'create-dept', label: deptForm.id ? '✏️ Edit Department' : '➕ Add Department' },
                    { key: 'create-admin', label: adminForm.id ? '✏️ Edit Admin' : '➕ Add Admin' },
                ].map(t => (
                    <button
                        key={t.key}
                        onClick={() => setActiveTab(t.key)}
                        className={`px-4 py-2 text-sm font-medium rounded-t-lg transition border-b-2 ${activeTab === t.key
                            ? 'border-purple-500 text-purple-300 bg-purple-900/20'
                            : 'border-transparent text-gray-400 hover:text-white hover:bg-gray-800/40'
                            }`}
                    >
                        {t.label}
                    </button>
                ))}
            </nav>

            <main className="p-6 max-w-7xl mx-auto">

                {/* ── OVERVIEW ── */}
                {activeTab === 'overview' && (
                    <div>
                        <h2 className="text-2xl font-bold mb-6 text-white">College Overview</h2>
                        {/* Stat Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                            {[
                                { label: 'Total Departments', value: stats?.totalDepts ?? '–', color: 'from-purple-600 to-indigo-600', icon: '🏛️' },
                                { label: 'Total Admins', value: stats?.admins?.length ?? '–', color: 'from-blue-600 to-cyan-600', icon: '👤' },
                                { label: 'Total Faculty', value: stats?.totalFaculty ?? '–', color: 'from-green-600 to-emerald-600', icon: '🎓' },
                                { label: 'Total Staff', value: stats?.totalStaff ?? '–', color: 'from-orange-500 to-amber-500', icon: '🧑‍💼' },
                            ].map(c => (
                                <div key={c.label} className={`rounded-2xl p-5 bg-gradient-to-br ${c.color} shadow-lg`}>
                                    <div className="text-3xl mb-2">{c.icon}</div>
                                    <div className="text-3xl font-bold">{c.value}</div>
                                    <div className="text-sm opacity-80 mt-1">{c.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Department Cards */}
                        <h3 className="text-lg font-semibold mb-4 text-gray-300">Departments & Admins</h3>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {departments.length === 0 && (
                                <div className="col-span-3 text-center py-12 text-gray-500">
                                    <p className="text-4xl mb-3">🏛️</p>
                                    <p>No departments yet. Create one in the <span className="text-purple-400">Add Department</span> tab.</p>
                                </div>
                            )}
                            {departments.map(dept => {
                                const deptAdmins = getAdminsForDept(dept.id);
                                const icon = DEPT_ICONS[dept.code] || '🏫';
                                return (
                                    <div key={dept.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-purple-700/60 transition group relative">
                                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => { setDeptForm(dept); setActiveTab('create-dept'); }}
                                                className="p-1.5 bg-blue-600/20 text-blue-400 rounded hover:bg-blue-600/40 transition"
                                                title="Edit Department"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                onClick={() => deleteDepartment(dept.id)}
                                                className="p-1.5 bg-red-600/20 text-red-400 rounded hover:bg-red-600/40 transition"
                                                title="Delete Department"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="text-3xl">{icon}</span>
                                            <div>
                                                <h4 className="font-bold text-white">{dept.name}</h4>
                                                <span className="text-xs bg-purple-900/40 text-purple-300 px-2 py-0.5 rounded-full">{dept.code}</span>
                                            </div>
                                        </div>
                                        <div className="text-sm text-gray-400">
                                            {deptAdmins.length === 0
                                                ? <span className="text-yellow-500">⚠️ No admin assigned</span>
                                                : deptAdmins.map(a => (
                                                    <div key={a.id} className="flex items-center gap-2 mt-1">
                                                        <span className="w-2 h-2 rounded-full bg-green-400 inline-block"></span>
                                                        <span className="text-green-300">{a.username}</span>
                                                        <span className="text-gray-500 text-xs">({a.email})</span>
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ── DEPARTMENTS TAB ── */}
                {activeTab === 'departments' && (
                    <div>
                        <h2 className="text-2xl font-bold mb-6">All Departments</h2>
                        <div className="overflow-x-auto rounded-2xl border border-gray-800">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-900 text-gray-400 uppercase text-xs">
                                    <tr>
                                        <th className="px-4 py-3 text-left">#</th>
                                        <th className="px-4 py-3 text-left">Department Name</th>
                                        <th className="px-4 py-3 text-left">Code</th>
                                        <th className="px-4 py-3 text-left">Admins</th>
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {departments.map((d, i) => (
                                        <tr key={d.id} className="border-t border-gray-800 hover:bg-gray-900/60 transition">
                                            <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                                            <td className="px-4 py-3 font-medium text-white">{DEPT_ICONS[d.code] || '🏫'} {d.name}</td>
                                            <td className="px-4 py-3"><span className="bg-purple-900/30 text-purple-300 px-2 py-0.5 rounded text-xs">{d.code}</span></td>
                                            <td className="px-4 py-3 text-gray-400">{getAdminsForDept(d.id).map(a => a.username).join(', ') || <span className="text-yellow-500">None</span>}</td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => { setDeptForm(d); setActiveTab('create-dept'); }}
                                                        className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded text-xs hover:bg-blue-600/40 transition"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => deleteDepartment(d.id)}
                                                        className="px-3 py-1 bg-red-600/20 text-red-400 rounded text-xs hover:bg-red-600/40 transition"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ── ADMINS TAB ── */}
                {activeTab === 'admins' && (
                    <div>
                        <h2 className="text-2xl font-bold mb-6">All Admins</h2>
                        <div className="overflow-x-auto rounded-2xl border border-gray-800">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-900 text-gray-400 uppercase text-xs">
                                    <tr>
                                        <th className="px-4 py-3 text-left">#</th>
                                        <th className="px-4 py-3 text-left">Username</th>
                                        <th className="px-4 py-3 text-left">Email</th>
                                        <th className="px-4 py-3 text-left">Department</th>
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {admins.map((a, i) => (
                                        <tr key={a.id} className="border-t border-gray-800 hover:bg-gray-900/60 transition">
                                            <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                                            <td className="px-4 py-3 font-medium text-white">{a.username}</td>
                                            <td className="px-4 py-3 text-gray-400">{a.email}</td>
                                            <td className="px-4 py-3 text-purple-300">{a.departmentRef?.name || <span className="text-yellow-500">Unassigned</span>}</td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => { setAdminForm({ ...a, password: '' }); setActiveTab('create-admin'); }}
                                                        className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded text-xs hover:bg-blue-600/40 transition"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => deleteAdmin(a.id)}
                                                        className="px-3 py-1 bg-red-600/20 text-red-400 rounded text-xs hover:bg-red-600/40 transition"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ── CREATE/EDIT DEPARTMENT ── */}
                {activeTab === 'create-dept' && (
                    <div className="max-w-xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">{deptForm.id ? 'Edit Department' : 'Add Department'}</h2>
                            {deptForm.id && (
                                <button onClick={() => setDeptForm({ id: null, name: '', code: '' })} className="text-sm text-purple-400 hover:text-purple-300">
                                    Cancel Edit
                                </button>
                            )}
                        </div>
                        {!deptForm.id && (
                            <>
                                <p className="text-gray-400 text-sm mb-4">Quick-fill with a common department:</p>
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {DEPARTMENTS.map(d => (
                                        <button
                                            key={d}
                                            onClick={() => handleAutofillDept(d)}
                                            className="text-xs px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-full hover:bg-purple-900/40 hover:border-purple-600 transition text-gray-300"
                                        >
                                            {d}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                        <form onSubmit={createOrUpdateDepartment} className="bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-4 shadow-xl">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Department Name</label>
                                <input
                                    required
                                    value={deptForm.name}
                                    onChange={e => setDeptForm(f => ({ ...f, name: e.target.value }))}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500 transition-all shadow-inner"
                                    placeholder="e.g. Computer Science Engineering"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Department Code</label>
                                <input
                                    required
                                    value={deptForm.code}
                                    onChange={e => setDeptForm(f => ({ ...f, code: e.target.value }))}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500 transition-all shadow-inner"
                                    placeholder="e.g. CSE"
                                />
                            </div>
                            {deptMsg && <p className="text-sm font-medium">{deptMsg}</p>}
                            <button type="submit" className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg font-semibold text-sm hover:opacity-90 transition shadow-lg shadow-purple-500/20 active:scale-[0.98]">
                                {deptForm.id ? 'Update Department' : 'Create Department'}
                            </button>
                        </form>
                    </div>
                )}

                {/* ── CREATE/EDIT ADMIN ── */}
                {activeTab === 'create-admin' && (
                    <div className="max-w-xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">{adminForm.id ? 'Edit Admin' : 'Add Admin'}</h2>
                            {adminForm.id && (
                                <button onClick={() => setAdminForm({ id: null, username: '', email: '', password: '', departmentId: '' })} className="text-sm text-purple-400 hover:text-purple-300">
                                    Cancel Edit
                                </button>
                            )}
                        </div>
                        <form onSubmit={createOrUpdateAdmin} className="bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-4 shadow-xl">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Username</label>
                                <input
                                    required
                                    value={adminForm.username}
                                    onChange={e => setAdminForm(f => ({ ...f, username: e.target.value }))}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500 transition-all shadow-inner"
                                    placeholder="e.g. cse_admin"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Email</label>
                                <input
                                    required
                                    type="email"
                                    value={adminForm.email}
                                    onChange={e => setAdminForm(f => ({ ...f, email: e.target.value }))}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500 transition-all shadow-inner"
                                    placeholder="admin@college.edu"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">{adminForm.id ? 'Password (leave blank to keep same)' : 'Password'}</label>
                                <input
                                    required={!adminForm.id}
                                    type="password"
                                    value={adminForm.password}
                                    onChange={e => setAdminForm(f => ({ ...f, password: e.target.value }))}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500 transition-all shadow-inner"
                                    placeholder={adminForm.id ? "New password (optional)" : "Strong password"}
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Department</label>
                                <select
                                    required
                                    value={adminForm.departmentId}
                                    onChange={e => setAdminForm(f => ({ ...f, departmentId: e.target.value }))}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500 transition-all shadow-inner"
                                >
                                    <option value="">-- Select Department --</option>
                                    {departments.map(d => (
                                        <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                                    ))}
                                </select>
                                {departments.length === 0 && (
                                    <p className="text-xs text-yellow-400 mt-1">⚠️ No departments yet. Create a department first.</p>
                                )}
                            </div>
                            {adminMsg && <p className="text-sm font-medium">{adminMsg}</p>}
                            <button type="submit" className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg font-semibold text-sm hover:opacity-90 transition shadow-lg shadow-blue-500/20 active:scale-[0.98]">
                                {adminForm.id ? 'Update Admin' : 'Create Admin'}
                            </button>
                        </form>
                    </div>
                )}

            </main>
        </div>
    );
}
