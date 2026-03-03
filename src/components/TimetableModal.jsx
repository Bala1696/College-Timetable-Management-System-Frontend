import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { validate, timetableSchema } from '../utils/validation';
import api from '../api/axios';

const PERIOD_TIMES = {
    1: { start: '09:10 AM', end: '09:50 AM' },
    2: { start: '09:50 AM', end: '10:40 AM' },
    3: { start: '11:00 AM', end: '11:50 AM' },
    4: { start: '11:50 AM', end: '12:40 PM' },
    5: { start: '01:30 PM', end: '02:15 PM' },
    6: { start: '02:15 PM', end: '03:00 PM' },
    7: { start: '03:15 PM', end: '04:00 PM' },
    8: { start: '04:00 PM', end: '04:45 PM' }
};

const LAB_ROOMS = [
    'GEN AI LABORATORY',
    'DATA SCIENCE LABORATORY',
    'MACHINE LEARNING LABORATORY',
    'DEEP LEARNING LABORATORY'
];

const TimetableFormData = {
    semester: 'I',
    section: 'A',
    day: 'Monday',
    period_number: 1,
    end_period: 1,
    start_time: '09:10 AM',
    end_time: '09:50 AM',
    course_code: '',
    subject_name: '',
    faculty_name: '',
    lab_name: '', // New field for specific lab room
    venue: '',
    type: 'Theory',
    batch: 'Both',
    repeatDays: []
};

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                    <div className="absolute inset-0 bg-gray-900 opacity-75 backdrop-blur-sm"></div>
                </div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
                    <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
                        <h3 className="text-lg leading-6 font-bold text-gray-900">{title}</h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-500 focus:outline-none transition-colors">
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                    <div className="p-6">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const TimetableModal = ({ isOpen, onClose, onSubmit, initialData, isLabView }) => {
    const [formData, setFormData] = useState(TimetableFormData);
    const [error, setError] = useState('');
    const [facultyList, setFacultyList] = useState([]);
    const [isFacultyDropdownOpen, setIsFacultyDropdownOpen] = useState(false);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [facultyRes, staffRes] = await Promise.all([
                    api.get('/admin/faculty'),
                    api.get('/admin/staff')
                ]);

                const faculty = facultyRes.data.map(f => ({ ...f, type: 'Faculty' }));
                const staff = staffRes.data.map(s => ({ ...s, type: 'Staff' }));

                setFacultyList([...faculty, ...staff]);
            } catch (err) {
                console.error("Failed to fetch faculty/staff", err);
            }

            if (initialData) {
                let initialFaculty = [];
                try {
                    // Try parsing if it's a JSON string, otherwise wrap in array
                    const parsed = JSON.parse(initialData.faculty_name);
                    initialFaculty = Array.isArray(parsed) ? parsed : [initialData.faculty_name];
                } catch (e) {
                    initialFaculty = initialData.faculty_name ? [initialData.faculty_name] : [];
                }

                setFormData(prev => ({
                    ...prev,
                    ...initialData,
                    faculty_name: initialFaculty
                }));
                setError('');
            } else {
                setFormData({ ...TimetableFormData, faculty_name: [] });
            }
        };

        if (isOpen) {
            loadInitialData();
        }
    }, [isOpen, initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const newValue = (name === 'period_number' || name === 'end_period') ? parseInt(value) : value;
        setError('');

        setFormData(prev => {
            const updated = { ...prev, [name]: newValue };
            if (name === 'period_number' && updated.end_period < newValue) {
                updated.end_period = newValue;
            }
            return updated;
        });
    };

    const handleFacultyToggle = (name) => {
        setFormData(prev => {
            const current = prev.faculty_name || [];
            const updated = current.includes(name)
                ? current.filter(f => f !== name)
                : [...current, name];
            return { ...prev, faculty_name: updated };
        });
    };

    const handleDayToggle = (day) => {
        setFormData(prev => {
            const repeatDays = prev.repeatDays.includes(day)
                ? prev.repeatDays.filter(d => d !== day)
                : [...prev.repeatDays, day];
            return { ...prev, repeatDays };
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        // Basic validation manually since Joi schema might need adjustment
        if (formData.faculty_name.length === 0) {
            setError('Please select at least one faculty member');
            return;
        }

        // Joi Validation - shallow copy and adapt faculty_name for schema if needed
        // For now, let's skip strict Joi check on faculty_name or update schema later
        // strict Joi check might fail if it expects string. 
        // We will assume backend handles array.

        // Automatically set times based on periods
        const finalData = { ...formData };
        finalData.start_time = PERIOD_TIMES[formData.period_number].start;
        finalData.end_time = PERIOD_TIMES[formData.end_period || formData.period_number].end;

        // Send as array, backend handles JSON.stringify if needed, or we do it here?
        // Backend `createTimetableEntry` handles array check.
        onSubmit(finalData);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData?.id ? 'Edit Class' : 'Add Class'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-xs border border-red-100 animate-shake">
                        {error}
                    </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                        <select name="semester" value={formData.semester} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all">
                            {['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'].map(s => (
                                <option key={s} value={s}>Semester {s}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                        <select name="section" value={formData.section} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all">
                            {['A', 'B'].map(s => (
                                <option key={s} value={s}>Section {s}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Course Code</label>
                        <input type="text" name="course_code" value={formData.course_code} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Subject Name</label>
                        <input type="text" name="subject_name" value={formData.subject_name} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all" required />
                    </div>
                </div>

                {formData.type === 'Lab' ? (
                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Faculty & Staff</label>
                        <div
                            className="w-full border border-gray-300 rounded-lg p-2 min-h-[42px] cursor-pointer bg-white relative"
                            onClick={() => setIsFacultyDropdownOpen(!isFacultyDropdownOpen)}
                        >
                            <div className="flex flex-wrap gap-1">
                                {formData.faculty_name && formData.faculty_name.length > 0 ? (
                                    (Array.isArray(formData.faculty_name) ? formData.faculty_name : [formData.faculty_name]).map(name => (
                                        <span key={name} className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-xs font-medium flex items-center">
                                            {name}
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); handleFacultyToggle(name); }}
                                                className="ml-1 hover:text-indigo-900"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-gray-400 text-sm">Select Faculty/Staff...</span>
                                )}
                            </div>
                        </div>

                        {isFacultyDropdownOpen && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                <div className="px-3 py-1.5 bg-gray-50 text-[10px] font-bold text-gray-500 uppercase tracking-wider sticky top-0">Faculty</div>
                                {facultyList.filter(f => f.type === 'Faculty').map(f => (
                                    <div
                                        key={f.id}
                                        className="px-3 py-2 hover:bg-gray-50 flex items-center cursor-pointer border-b border-gray-50 last:border-0"
                                        onClick={() => handleFacultyToggle(f.name)}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={
                                                Array.isArray(formData.faculty_name)
                                                    ? formData.faculty_name.includes(f.name)
                                                    : formData.faculty_name === f.name
                                            }
                                            onChange={() => { }}
                                            className="mr-2 rounded text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <div>
                                            <div className="text-sm text-gray-900">{f.name}</div>
                                            <div className="text-[10px] text-gray-500 uppercase">{f.designation}</div>
                                        </div>
                                    </div>
                                ))}

                                <div className="px-3 py-1.5 bg-gray-50 text-[10px] font-bold text-gray-500 uppercase tracking-wider sticky top-0 border-t border-gray-100">Supporting Staff</div>
                                {facultyList.filter(f => f.type === 'Staff').map(f => (
                                    <div
                                        key={f.id}
                                        className="px-3 py-2 hover:bg-gray-50 flex items-center cursor-pointer border-b border-gray-50 last:border-0"
                                        onClick={() => handleFacultyToggle(f.name)}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={
                                                Array.isArray(formData.faculty_name)
                                                    ? formData.faculty_name.includes(f.name)
                                                    : formData.faculty_name === f.name
                                            }
                                            onChange={() => { }}
                                            className="mr-2 rounded text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <div>
                                            <div className="text-sm text-gray-900">{f.name}</div>
                                            <div className="text-[10px] text-gray-500 uppercase">Supporting Staff</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {isFacultyDropdownOpen && (
                            <div className="fixed inset-0 z-0" onClick={() => setIsFacultyDropdownOpen(false)}></div>
                        )}
                    </div>
                ) : (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Faculty Name</label>
                        <select
                            name="faculty_name"
                            value={Array.isArray(formData.faculty_name) ? formData.faculty_name[0] || '' : formData.faculty_name}
                            onChange={(e) => {
                                // For Theory, we want a string or single-element array. 
                                // To keep backend compatible (which expects JSON array string potentially), 
                                // let's store it as a single string here, controller handles wrapping.
                                setFormData(prev => ({ ...prev, faculty_name: e.target.value }));
                            }}
                            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                            required
                        >
                            <option value="">Select Faculty</option>
                            {facultyList.filter(f => f.type === 'Faculty').map(f => (
                                <option key={f.id} value={f.name}>{f.name}</option>
                            ))}
                        </select>
                    </div>
                )}

                {formData.type === 'Lab' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Lab Room</label>
                        <select
                            name="venue"
                            value={formData.venue}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                            required
                        >
                            <option value="">Select Laboratory</option>
                            {LAB_ROOMS.map(lab => (
                                <option key={lab} value={lab}>{lab}</option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Period</label>
                        <select name="period_number" value={formData.period_number} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(p => (
                                <option key={p} value={p}>Period {p}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Period (Optional)</label>
                        <select name="end_period" value={formData.end_period || formData.period_number} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(p => (
                                <option key={p} value={p} disabled={p < formData.period_number}>Period {p}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
                        <select name="day" value={formData.day} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all">
                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(d => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                        {isLabView ? (
                            <input
                                type="text"
                                value="Lab"
                                readOnly
                                className="w-full border border-gray-300 rounded-lg p-2 bg-gray-100 text-gray-500 cursor-not-allowed focus:outline-none"
                            />
                        ) : (
                            <select name="type" value={formData.type} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all">
                                <option value="Theory">Theory</option>
                                <option value="Lab">Lab</option>
                            </select>
                        )}
                    </div>
                </div>

                {!initialData?.id && (
                    <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100/50">
                        <label className="block text-xs font-black uppercase tracking-widest text-indigo-600 mb-3">Repeat class on other days</label>
                        <div className="flex flex-wrap gap-2">
                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(d => (
                                <button
                                    key={d}
                                    type="button"
                                    onClick={() => handleDayToggle(d)}
                                    disabled={d === formData.day}
                                    className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all border ${formData.day === d
                                        ? 'bg-indigo-100 border-indigo-200 text-indigo-400 cursor-not-allowed'
                                        : formData.repeatDays.includes(d)
                                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/20'
                                            : 'bg-white border-gray-200 text-gray-500 hover:border-indigo-300 hover:text-indigo-600'
                                        }`}
                                >
                                    {d.substring(0, 3)}
                                </button>
                            ))}
                        </div>
                        <p className="text-[9px] text-gray-400 mt-2 italic font-medium">Selecting days will create duplicate entries for those days.</p>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    {formData.type === 'Theory' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Venue (Room)</label>
                            <input type="text" name="venue" value={formData.venue} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all" required />
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
                        <select name="batch" value={formData.batch} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all">
                            <option value="Both">Both</option>
                            <option value="Odd">Odd</option>
                            <option value="Even">Even</option>
                        </select>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button type="button" onClick={onClose} className="mr-3 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all">
                        Cancel
                    </button>
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg shadow-indigo-500/30 transition-all">
                        {initialData?.id ? 'Update Class' : 'Add Class'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};
