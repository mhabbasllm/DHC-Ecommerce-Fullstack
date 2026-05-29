import React from 'react';

const AdminFooter = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-4 px-6 text-center text-sm text-gray-500">
      &copy; {new Date().getFullYear()} AdminPro. All rights reserved.
    </footer>
  );
};

export default AdminFooter;
