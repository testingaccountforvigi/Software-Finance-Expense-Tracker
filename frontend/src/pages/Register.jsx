import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/Toast';
import Input from '../components/Input';
import Select from '../components/Select';
import Button from '../components/Button';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useApp();
  const { success, error: showError } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    professionalStatus: 'Student',
    organization: '',
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const professionalStatuses = [
    { value: 'Student', label: 'Student' },
    { value: 'Working Professional', label: 'Working Professional' },
    { value: 'Self Employed', label: 'Self Employed' },
    { value: 'Other', label: 'Other' },
  ];

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, number, and special character (@$!%*?&#)';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const userData = {
        email: formData.email,
        password: formData.password,
        full_name: formData.name,
        professional_status: formData.professionalStatus,
        organization: formData.organization || null,
      };
      
      const result = await register(userData);
      
      if (result.success) {
        success('Account created successfully!');
        navigate('/dashboard');
      } else {
        showError(result.error || 'Registration failed. Please try again.');
      }
    } catch (err) {
      showError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-neutral-900 mb-2">Create your account</h1>
          <p className="text-neutral-600">Start tracking your expenses today</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Full Name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              placeholder="John Doe"
              required
            />

            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="you@example.com"
              required
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="••••••••"
              required
            />

            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              placeholder="••••••••"
              required
            />

            <Select
              label="Professional Status"
              name="professionalStatus"
              value={formData.professionalStatus}
              onChange={handleChange}
              options={professionalStatuses}
              required
            />

            <Input
              label="Organization (Optional)"
              type="text"
              name="organization"
              value={formData.organization}
              onChange={handleChange}
              placeholder="Company name"
            />

            <div>
              <label className="flex items-start">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  className="w-4 h-4 mt-0.5 text-neutral-900 border-neutral-300 rounded focus:ring-neutral-900"
                />
                <span className="ml-2 text-sm text-neutral-700">
                  I agree to the terms and conditions
                </span>
              </label>
              {errors.agreeToTerms && (
                <p className="mt-1.5 text-sm text-red-600">{errors.agreeToTerms}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-600">
              Already have an account?{' '}
              <Link to="/login" className="text-neutral-900 font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
