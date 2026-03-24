import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';

/**
 * ContactFormPage – add or edit a contact.
 * Supports multiple phone numbers and emails.
 */
export default function ContactFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [phoneNumbers, setPhoneNumbers] = useState([{ phoneNumber: '' }]);
  const [emails, setEmails] = useState([{ email: '' }]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  // Load existing contact for editing
  useEffect(() => {
    if (!isEdit) return;
    const loadContact = async () => {
      try {
        const res = await api.get('/contacts', { params: { page: 0, size: 1000 } });
        const contact = res.data.content.find(c => c.id === parseInt(id));
        if (contact) {
          setFirstName(contact.firstName);
          setLastName(contact.lastName || '');
          setBirthday(contact.birthday || '');
          setPhoneNumbers(
            contact.phoneNumbers.length > 0 
              ? contact.phoneNumbers.map(p => ({ phoneNumber: p.phoneNumber }))
              : [{ phoneNumber: '' }]
          );
          setEmails(
            contact.emails.length > 0
              ? contact.emails.map(e => ({ email: e.email }))
              : [{ email: '' }]
          );
        }
      } catch {
        setError('Failed to load contact');
      } finally {
        setFetching(false);
      }
    };
    loadContact();
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate at least one phone number
    const validPhones = phoneNumbers.filter(p => p.phoneNumber.trim());
    if (validPhones.length === 0) {
      setError('At least one phone number is required');
      return;
    }

    // Validate phone number lengths
    const invalidPhones = validPhones.filter(p => p.phoneNumber.trim().length < 7);
    if (invalidPhones.length > 0) {
      setError('All phone numbers must be at least 7 characters');
      return;
    }

    // Validate emails (if any provided)
    const validEmails = emails.filter(e => e.email.trim());
    const invalidEmails = validEmails.filter(e => !e.email.includes('@') || !e.email.includes('.'));
    if (invalidEmails.length > 0) {
      setError('All email addresses must be valid');
      return;
    }

    setLoading(true);
    const payload = {
      firstName: firstName.trim(),
      lastName: lastName.trim() || null,
      birthday: birthday || null,
      phoneNumbers: validPhones,
      emails: validEmails,
    };

    try {
      if (isEdit) {
        await api.put(`/contacts/${id}`, payload);
      } else {
        await api.post('/contacts', payload);
      }
      navigate('/');
    } catch (err) {
      const data = err.response?.data;
      if (data?.fieldErrors) {
        setError(Object.values(data.fieldErrors).join(', '));
      } else {
        setError(data?.error || 'Failed to save contact');
      }
    } finally {
      setLoading(false);
    }
  };

  // Dynamic phone number fields
  const addPhone = () => setPhoneNumbers([...phoneNumbers, { phoneNumber: '' }]);
  const removePhone = (index) => {
    if (phoneNumbers.length <= 1) return;
    setPhoneNumbers(phoneNumbers.filter((_, i) => i !== index));
  };
  const updatePhone = (index, value) => {
    const updated = [...phoneNumbers];
    updated[index].phoneNumber = value;
    setPhoneNumbers(updated);
  };

  // Helper to validate phone number length
  const isPhoneNumberValid = (phone) => {
    const trimmed = phone.trim();
    return trimmed.length === 0 || trimmed.length == 10;
  };

  // Get validation message for a phone number
  const getPhoneValidationMessage = (phone) => {
    const trimmed = phone.trim();
    if (trimmed.length === 0) return '';
    if (trimmed.length < 10) {
      return `⚠️ Phone number must be at least 10 characters (currently ${trimmed.length})`;
    }
    return '✓ Valid';
  };

  
  const addEmail = () => setEmails([...emails, { email: '' }]);
  const removeEmail = (index) => {
    setEmails(emails.filter((_, i) => i !== index));
  };
  const updateEmail = (index, value) => {
    const updated = [...emails];
    updated[index].email = value;
    setEmails(updated);
  };

  if (fetching) return <LoadingSpinner message="Loading contact..." />;

  return (
    <div className="form-page">
      <div className="form-card">
        <h2>{isEdit ? 'Edit Contact' : 'Add New Contact'}</h2>
        {error && (
          <div className="error-message" style={{ 
            backgroundColor: '#ffe6e6', 
            borderLeft: '4px solid #e74c3c',
            padding: '12px',
            borderRadius: '4px',
            marginBottom: '20px'
          }}>
            <strong>Error:</strong> {error}
          </div>
        )}
        {/* Form fields */}
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name *</label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="birthday">Birthday</label>
            <input
              id="birthday"
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
            />
          </div>

          {/* Phone Numbers */}
          <div className="form-group">
            <label>Phone Numbers *</label>
            {phoneNumbers.map((phone, index) => (
              <div key={index} className="dynamic-field">
                <div>
                  <input
                    type="tel"
                    value={phone.phoneNumber}
                    onChange={(e) => updatePhone(index, e.target.value)}
                    placeholder="+1 234 567 8900"
                  />
                  {phoneNumbers.length > 1 && (
                    <button type="button" onClick={() => removePhone(index)} className="btn btn-remove">
                      ✕
                    </button>
                  )}
                </div>
                {phone.phoneNumber && !isPhoneNumberValid(phone.phoneNumber) && (
                  <small style={{ color: '#e74c3c', display: 'block', marginTop: '4px' }}>
                    {getPhoneValidationMessage(phone.phoneNumber)}
                  </small>
                )}
                {phone.phoneNumber && isPhoneNumberValid(phone.phoneNumber) && phone.phoneNumber.trim().length >= 7 && (
                  <small style={{ color: '#27ae60', display: 'block', marginTop: '4px' }}>
                    ✓ Valid
                  </small>
                )}
              </div>
            ))}
            <button type="button" onClick={addPhone} className="btn btn-add">
              + Add Phone Number
            </button>
          </div>

          {/* Emails */}
          <div className="form-group">
            <label>Emails</label>
            {emails.map((email, index) => (
              <div key={index} className="dynamic-field">
                <input
                  type="email"
                  value={email.email}
                  onChange={(e) => updateEmail(index, e.target.value)}
                  placeholder="john@example.com"
                />
                <button type="button" onClick={() => removeEmail(index)} className="btn btn-remove">
                  ✕
                </button>
              </div>
            ))}
            <button type="button" onClick={addEmail} className="btn btn-add">
              + Add Email
            </button>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner-small"></span> : (isEdit ? 'Update Contact' : 'Create Contact')}
            </button>
            <button type="button" onClick={() => navigate('/')} className="btn btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
