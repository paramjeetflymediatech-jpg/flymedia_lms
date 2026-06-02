"use client";

import Swal from 'sweetalert2';

interface DeleteConfirmButtonProps {
  onDelete: () => Promise<void>;
  itemType: string;
  className?: string;
  children?: React.ReactNode;
}

export default function DeleteConfirmButton({ onDelete, itemType, className, children }: DeleteConfirmButtonProps) {
  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form submission if inside a form
    Swal.fire({
      title: `Delete ${itemType}?`,
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await onDelete();
          Swal.fire({
            title: 'Deleted!',
            text: `The ${itemType.toLowerCase()} has been deleted.`,
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          });
        } catch (error: any) {
          Swal.fire({
            title: 'Error!',
            text: error.message || 'Something went wrong.',
            icon: 'error'
          });
        }
      }
    });
  };

  return (
    <button 
      onClick={handleDelete}
      className={className || "text-slate-400 hover:text-red-600 transition-colors"} 
      title={`Delete ${itemType}`}
    >
      {children || (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      )}
    </button>
  );
}
