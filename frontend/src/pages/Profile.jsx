import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/Toast';
import Input from '../components/Input';
import Select from '../components/Select';
import Button from '../components/Button';

const Profile = () => {
  const { currentUser, updateUserProfile } = useApp();
  const { success, error: showError } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    age: '',
    professionalStatus: '',
    organization: '',
    role: '',
    currency: 'INR',
    monthlyIncome: '',
  });

  // Load user data when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setFormData({
        fullName: currentUser.full_name || '',
        email: currentUser.email || '',
        age: currentUser.age || '',
        professionalStatus: currentUser.professional_status || '',
        organization: currentUser.organization || '',
        role: currentUser.role || '',
        currency: currentUser.currency || 'INR',
        monthlyIncome: currentUser.monthly_income || '',
      });
    }
  }, [currentUser]);

  const handleSave = async () => {
    try {
      await updateUserProfile(formData);
      success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      showError('Failed to update profile');
    }
  };

  const professionalStatuses = [
    { value: 'Student', label: 'Student' },
    { value: 'Working Professional', label: 'Working Professional' },
    { value: 'Self Employed', label: 'Self Employed' },
    { value: 'Other', label: 'Other' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-neutral-900 mb-1">Profile</h1>
        <p className="text-neutral-600">Manage your account information and preferences</p>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-neutral-900">Personal Information</h2>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
          )}
        </div>

        {!isEditing ? (
          <div className="space-y-4">
            <div className="flex items-center pb-4 border-b border-neutral-100">
              <div className="w-20 h-20 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-600 text-2xl font-semibold mr-6">
                {currentUser?.full_name?.charAt(0) || 'U'}
              </div>
              <div>
                <p className="text-xl font-semibold text-neutral-900">{currentUser?.full_name || 'User'}</p>
                <p className="text-neutral-600">{currentUser?.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div>
                <p className="text-sm text-neutral-500 mb-1">Age</p>
                <p className="text-neutral-900 font-medium">{currentUser?.age || 'Not set'}</p>
              </div>

              <div>
                <p className="text-sm text-neutral-500 mb-1">Professional Status</p>
                <p className="text-neutral-900 font-medium">{currentUser?.professional_status || 'Not set'}</p>
              </div>

              <div>
                <p className="text-sm text-neutral-500 mb-1">Organization</p>
                <p className="text-neutral-900 font-medium">{currentUser?.organization || 'Not set'}</p>
              </div>

              <div>
                <p className="text-sm text-neutral-500 mb-1">Role</p>
                <p className="text-neutral-900 font-medium">{currentUser?.role || 'Not set'}</p>
              </div>

              <div>
                <p className="text-sm text-neutral-500 mb-1">Currency</p>
                <p className="text-neutral-900 font-medium">{currentUser?.currency || 'INR'}</p>
              </div>

              <div>
                <p className="text-sm text-neutral-500 mb-1">Monthly Income</p>
                <p className="text-neutral-900 font-medium">
                  {currentUser?.monthly_income ? `₹${parseFloat(currentUser.monthly_income).toLocaleString('en-IN')}` : 'Not set'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Full Name"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />

              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled
                className="bg-neutral-50"
              />

              <Input
                label="Age"
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              />

              <Select
                label="Professional Status"
                value={formData.professionalStatus}
                onChange={(e) => setFormData({ ...formData, professionalStatus: e.target.value })}
                options={professionalStatuses}
              />

              <Input
                label="Organization"
                value={formData.organization}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
              />

              <Input
                label="Role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              />

              <Select
                label="Currency"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                options={[
                  { value: 'INR', label: 'INR (₹)' },
                  { value: 'USD', label: 'USD ($)' },
                  { value: 'EUR', label: 'EUR (€)' },
                ]}
              />

              <Input
                label="Monthly Income"
                type="number"
                value={formData.monthlyIncome}
                onChange={(e) => setFormData({ ...formData, monthlyIncome: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-neutral-200">
              <Button
                variant="secondary"
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    fullName: currentUser?.full_name || '',
                    email: currentUser?.email || '',
                    age: currentUser?.age || '',
                    professionalStatus: currentUser?.professional_status || '',
                    organization: currentUser?.organization || '',
                    role: currentUser?.role || '',
                    currency: currentUser?.currency || 'INR',
                    monthlyIncome: currentUser?.monthly_income || '',
                  });
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSave}>Save Changes</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
