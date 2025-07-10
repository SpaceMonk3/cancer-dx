'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Upload, Image, X, FileText, Loader2 } from 'lucide-react';

export function UploadSection({ onUploadComplete }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles) => {
    const validFiles = acceptedFiles.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
      
      if (!isValidType) {
        toast.error(`${file.name} is not a valid image file`);
        return false;
      }
      if (!isValidSize) {
        toast.error(`${file.name} is too large (max 10MB)`);
        return false;
      }
      return true;
    });

    setFiles(prev => [...prev, ...validFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      preview: URL.createObjectURL(file)
    }))]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.tiff', '.bmp']
    },
    multiple: true,
    maxFiles: 5
  });

  const removeFile = (id) => {
    setFiles(prev => {
      const fileToRemove = prev.find(f => f.id === id);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter(f => f.id !== id);
    });
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error('Please select at least one image');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      files.forEach(({ file }) => {
        formData.append('images', file);
      });

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 15;
        });
      }, 200);

      // Simulate API call - replace with actual upload
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setUploadProgress(100);
      clearInterval(progressInterval);
      
      toast.success(`${files.length} image(s) uploaded successfully`);
      
      // Clean up
      files.forEach(({ preview }) => URL.revokeObjectURL(preview));
      setFiles([]);
      
      if (onUploadComplete) {
        onUploadComplete(files);
      }
    } catch (error) {
      toast.error('Upload failed. Please try again.');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Card className="medical-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Image className="h-5 w-5 text-blue-600" />
          <span>Upload Histopathology Images</span>
        </CardTitle>
        <CardDescription>
          Upload high-resolution histopathology images for rhabdomyosarcoma analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`upload-zone ${isDragActive ? 'dragover' : ''} rounded-lg p-8 text-center cursor-pointer transition-all duration-200`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-blue-400 mb-4" />
          <p className="text-lg font-medium text-gray-700 mb-2">
            {isDragActive ? 'Drop images here' : 'Drag & drop images here'}
          </p>
          <p className="text-sm text-gray-500 mb-4">
            or click to select files (PNG, JPG, JPEG, TIFF, BMP)
          </p>
          <p className="text-xs text-gray-400">
            Max file size: 10MB • Max files: 5
          </p>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-700">Selected Images ({files.length})</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {files.map(({ file, id, preview }) => (
                <div key={id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <img 
                      src={preview} 
                      alt={file.name}
                      className="h-12 w-12 rounded object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {uploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Uploading images...</span>
              <span className="text-sm text-gray-600">{Math.round(uploadProgress)}%</span>
            </div>
            <Progress value={uploadProgress} className="w-full" />
          </div>
        )}

        {/* Upload Button */}
        <Button
          onClick={handleUpload}
          disabled={files.length === 0 || uploading}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <FileText className="mr-2 h-4 w-4" />
              Upload {files.length > 0 ? `${files.length} Image${files.length > 1 ? 's' : ''}` : 'Images'}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}