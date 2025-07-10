'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { User, Calendar, MapPin, FileText, Loader2 } from 'lucide-react';

export function ClinicalForm({ onSubmit, loading = false }) {
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    tumorSite: '',
    tumorSize: '',
    symptoms: [],
    histology: '',
    stage: '',
    priorTreatment: '',
    familyHistory: false,
    notes: ''
  });

  const symptomOptions = [
    'Swelling/Mass',
    'Pain',
    'Limited mobility',
    'Muscle weakness',
    'Fatigue',
    'Weight loss',
    'Other'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSymptomChange = (symptom, checked) => {
    setFormData(prev => ({
      ...prev,
      symptoms: checked 
        ? [...prev.symptoms, symptom]
        : prev.symptoms.filter(s => s !== symptom)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.age || !formData.gender || !formData.tumorSite) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (parseInt(formData.age) < 0 || parseInt(formData.age) > 120) {
      toast.error('Please enter a valid age');
      return;
    }

    onSubmit(formData);
  };

  return (
    <Card className="medical-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <User className="h-5 w-5 text-teal-600" />
          <span>Clinical Information</span>
        </CardTitle>
        <CardDescription>
          Enter patient clinical data to enhance diagnostic accuracy
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Demographics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age" className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>Age *</span>
              </Label>
              <Input
                id="age"
                type="number"
                placeholder="Enter age"
                value={formData.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
                min="0"
                max="120"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label>Gender *</Label>
              <Select 
                value={formData.gender} 
                onValueChange={(value) => handleInputChange('gender', value)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tumor Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center space-x-1">
                <MapPin className="h-4 w-4" />
                <span>Tumor Site *</span>
              </Label>
              <Select 
                value={formData.tumorSite} 
                onValueChange={(value) => handleInputChange('tumorSite', value)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select tumor location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="head-neck">Head and Neck</SelectItem>
                  <SelectItem value="trunk">Trunk</SelectItem>
                  <SelectItem value="extremities">Extremities</SelectItem>
                  <SelectItem value="genitourinary">Genitourinary</SelectItem>
                  <SelectItem value="retroperitoneal">Retroperitoneal</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tumorSize">Tumor Size (cm)</Label>
              <Input
                id="tumorSize"
                type="number"
                placeholder="Enter size"
                value={formData.tumorSize}
                onChange={(e) => handleInputChange('tumorSize', e.target.value)}
                min="0"
                step="0.1"
                disabled={loading}
              />
            </div>
          </div>

          {/* Symptoms */}
          <div className="space-y-3">
            <Label>Presenting Symptoms</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {symptomOptions.map((symptom) => (
                <div key={symptom} className="flex items-center space-x-2">
                  <Checkbox
                    id={`symptom-${symptom}`}
                    checked={formData.symptoms.includes(symptom)}
                    onCheckedChange={(checked) => handleSymptomChange(symptom, checked)}
                    disabled={loading}
                  />
                  <Label 
                    htmlFor={`symptom-${symptom}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {symptom}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Medical History */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Histological Grade</Label>
              <Select 
                value={formData.histology} 
                onValueChange={(value) => handleInputChange('histology', value)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low Grade</SelectItem>
                  <SelectItem value="intermediate">Intermediate Grade</SelectItem>
                  <SelectItem value="high">High Grade</SelectItem>
                  <SelectItem value="unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Clinical Stage</Label>
              <Select 
                value={formData.stage} 
                onValueChange={(value) => handleInputChange('stage', value)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="I">Stage I</SelectItem>
                  <SelectItem value="II">Stage II</SelectItem>
                  <SelectItem value="III">Stage III</SelectItem>
                  <SelectItem value="IV">Stage IV</SelectItem>
                  <SelectItem value="unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="priorTreatment">Prior Treatment</Label>
              <Input
                id="priorTreatment"
                placeholder="e.g., Chemotherapy, Radiation, Surgery"
                value={formData.priorTreatment}
                onChange={(e) => handleInputChange('priorTreatment', e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="familyHistory"
                checked={formData.familyHistory}
                onCheckedChange={(checked) => handleInputChange('familyHistory', checked)}
                disabled={loading}
              />
              <Label htmlFor="familyHistory" className="text-sm font-normal cursor-pointer">
                Family history of cancer
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="flex items-center space-x-1">
                <FileText className="h-4 w-4" />
                <span>Additional Notes</span>
              </Label>
              <Textarea
                id="notes"
                placeholder="Any additional clinical observations or notes..."
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
                disabled={loading}
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-teal-600 hover:bg-teal-700"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Submit Clinical Data'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}