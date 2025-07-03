export const getSubjectColor = (subject) => {
  const colors = {
    'Operating Systems': 'bg-purple-100 text-purple-800 border-purple-200',
    'DBMS': 'bg-blue-100 text-blue-800 border-blue-200',
    'Computer Networks': 'bg-green-100 text-green-800 border-green-200',
    'Data Structures': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Algorithms': 'bg-red-100 text-red-800 border-red-200',
    'Machine Learning': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'Web Development': 'bg-pink-100 text-pink-800 border-pink-200',
    'Python': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'JavaScript': 'bg-amber-100 text-amber-800 border-amber-200',
    'React': 'bg-cyan-100 text-cyan-800 border-cyan-200'
  };
  return colors[subject] || 'bg-gray-100 text-gray-800 border-gray-200';
};

export const getPriorityColor = (priority) => {
  const colors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800'
  };
  return colors[priority] || colors.medium;
}; 