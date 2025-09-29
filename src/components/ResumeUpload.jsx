import React, { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { uploadResume } from '../store/candidateSlice';
import { Upload, FileText, AlertCircle } from 'lucide-react';

const ResumeUpload = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector(state => state.candidate);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = useCallback((e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  }, []);

  const handleFile = (file) => {
    if (!file.type.includes('pdf') && !file.type.includes('document')) {
      alert('Please upload a PDF or DOCX file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size should be less than 5MB');
      return;
    }

    dispatch(uploadResume(file));
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Upload Your Resume</h3>
        <p className="text-gray-600">Upload your resume to get started with the AI interview</p>
      </div>

      <div
        className={`relative border-2 border-dashed rounded-xl p-8 transition-colors ${
          dragActive
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleChange}
          disabled={loading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            {loading ? (
              <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
            ) : (
              <Upload className="w-8 h-8 text-blue-600" />
            )}
          </div>
          
          <p className="text-lg font-medium text-gray-900 mb-2">
            {loading ? 'Processing resume...' : 'Drop your resume here'}
          </p>
          <p className="text-gray-600 mb-4">or click to browse files</p>
          
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <FileText size={16} />
              <span>PDF, DOCX</span>
            </div>
            <span>•</span>
            <span>Max 5MB</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-red-700">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default ResumeUpload;