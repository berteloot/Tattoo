import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { api } from '../services/api';
import { 
  Upload, 
  Download, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminStudioUpload = () => {
  const { user } = useAuth();
  const { success: showSuccessToast, error: showErrorToast } = useToast();
  
  const [csvData, setCsvData] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  // Check if current user is admin
  const { isAdmin } = useAuth();
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setCsvData(e.target.result);
    };
    reader.readAsText(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        handleFileUpload(file);
      } else {
        showErrorToast('Invalid File', 'Please upload a CSV file');
      }
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const downloadTemplate = async () => {
    try {
      const response = await api.get('/admin/studios-csv-template', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'studios-template.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      showSuccessToast('Template Downloaded', 'CSV template downloaded successfully');
    } catch (error) {
      console.error('Error downloading template:', error);
      showErrorToast('Download Error', 'Failed to download template');
    }
  };

  const uploadStudios = async () => {
    if (!csvData.trim()) {
      showErrorToast('No Data', 'Please provide CSV data');
      return;
    }

    try {
      setUploading(true);
      setUploadResults(null);
      
      const response = await api.post('/admin/upload-studios-csv', {
        csvData: csvData
      });
      
      setUploadResults(response.data.data);
      showSuccessToast(
        'Upload Successful', 
        `${response.data.data.successful} studios uploaded successfully`
      );
      
      // Clear the form after successful upload
      setCsvData('');
      
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error.response?.data?.error || 'Failed to upload studios';
      showErrorToast('Upload Error', errorMessage);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/admin/dashboard" 
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Admin Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Studio CSV Upload</h1>
          <p className="mt-2 text-gray-600">
            Upload multiple studios at once using a CSV file
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Studios</h2>
            
            {/* Template Download */}
            <div className="mb-6">
              <button
                onClick={downloadTemplate}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Template
              </button>
              <p className="mt-2 text-sm text-gray-500">
                Download the CSV template to see the required format
              </p>
            </div>

            {/* File Upload Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center ${
                dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <span className="mt-2 block text-sm font-medium text-gray-900">
                    Drop your CSV file here, or{' '}
                    <span className="text-blue-600 hover:text-blue-500">browse</span>
                  </span>
                </label>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  accept=".csv"
                  onChange={handleFileInput}
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                CSV files only, max 10MB
              </p>
            </div>

            {/* CSV Data Preview */}
            {csvData && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-2">CSV Preview</h3>
                <div className="bg-gray-50 rounded-md p-3 max-h-40 overflow-y-auto">
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                    {csvData.substring(0, 500)}
                    {csvData.length > 500 && '...'}
                  </pre>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  {csvData.split('\n').length - 1} rows detected
                </p>
              </div>
            )}

            {/* Upload Button */}
            <button
              onClick={uploadStudios}
              disabled={!csvData.trim() || uploading}
              className={`mt-6 w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
                !csvData.trim() || uploading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              }`}
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Studios
                </>
              )}
            </button>
          </div>

          {/* Results Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Results</h2>
            
            {uploadResults ? (
              <div className="space-y-4">
                {/* Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {uploadResults.total}
                      </div>
                      <div className="text-sm text-gray-500">Total</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {uploadResults.successful}
                      </div>
                      <div className="text-sm text-gray-500">Successful</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">
                        {uploadResults.failed}
                      </div>
                      <div className="text-sm text-gray-500">Failed</div>
                    </div>
                  </div>
                </div>

                {/* Success Rate */}
                {uploadResults.total > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                      <span className="text-sm font-medium text-green-800">
                        Success Rate: {Math.round((uploadResults.successful / uploadResults.total) * 100)}%
                      </span>
                    </div>
                  </div>
                )}

                {/* Errors */}
                {uploadResults.errors && uploadResults.errors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <XCircle className="w-5 h-5 text-red-400 mr-2" />
                      <span className="text-sm font-medium text-red-800">
                        Errors ({uploadResults.errors.length})
                      </span>
                    </div>
                    <div className="max-h-40 overflow-y-auto">
                      {uploadResults.errors.map((error, index) => (
                        <div key={index} className="text-xs text-red-700 mb-1">
                          {error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p>Upload results will appear here</p>
              </div>
            )}

            {/* Instructions */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-800 mb-2">CSV Format Requirements</h3>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• <strong>Required:</strong> title, address, city, state</li>
                <li>• <strong>Optional:</strong> zipcode, country, phone, email, website</li>
                <li>• <strong>Social Media:</strong> facebook, instagram, twitter, linkedin, youtube</li>
                <li>• <strong>Location:</strong> latitude, longitude (decimal format)</li>
                <li>• Use quotes around fields containing commas</li>
                <li>• All studios will be created as unverified initially</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStudioUpload; 