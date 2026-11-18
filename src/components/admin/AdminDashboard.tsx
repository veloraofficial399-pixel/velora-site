import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../context/StoreContext';
import { WeddingTemplate, CollectionTier } from '../../types';
import {
  X,
  Lock,
  Unlock,
  Settings,
  Users,
  LayoutTemplate,
  DollarSign,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  Download,
  CheckCircle,
  ExternalLink,
  Phone,
  Instagram,
  Database
} from 'lucide-react';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ isOpen, onClose }) => {
  const {
    templates,
    packages,
    settings,
    enquiries,
    updateSettings,
    updatePackagePrice,
    addTemplate,
    deleteTemplate,
    resetToDefaults
  } = useStore();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState(false);
  const [activeTab, setActiveTab] = useState<'enquiries' | 'templates' | 'pricing' | 'settings' | 'supabase'>('enquiries');

  // Form states for adding template
  const [showAddTemplate, setShowAddTemplate] = useState(false);
  const [newTplId, setNewTplId] = useState('');
  const [newTplName, setNewTplName] = useState('');
  const [newTplCollection, setNewTplCollection] = useState<CollectionTier>('A');
  const [newTplPrice, setNewTplPrice] = useState(499);
  const [newTplDemoUrl, setNewTplDemoUrl] = useState('');
  const [newTplImage, setNewTplImage] = useState('');
  const [newTplDesc, setNewTplDesc] = useState('');

  // Settings form states
  const [whatsappInput, setWhatsappInput] = useState(settings.whatsappNumber);
  const [instaInput, setInstaInput] = useState(settings.instagramHandle);
  const [taglineInput, setTaglineInput] = useState(settings.tagline);
  const [emailInput, setEmailInput] = useState(settings.contactEmail);
  const [savedNotice, setSavedNotice] = useState(false);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Default PIN: velora2026 or 1234
    if (passcode === 'velora2026' || passcode === '1234') {
      setIsAuthenticated(true);
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      whatsappNumber: whatsappInput,
      instagramHandle: instaInput,
      tagline: taglineInput,
      contactEmail: emailInput
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const handleCreateTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTplId || !newTplName || !newTplDemoUrl) return;

    const collectionMap: Record<CollectionTier, string> = {
      A: 'Starter Collection',
      B: 'Classic Collection',
      C: 'Royal Collection',
      D: 'Luxury Haute Collection',
      E: 'Bespoke Exclusive Collection'
    };

    const newTemplate: WeddingTemplate = {
      id: newTplId.toUpperCase(),
      name: newTplName,
      collection: newTplCollection,
      collectionName: collectionMap[newTplCollection],
      price: Number(newTplPrice),
      demoUrl: newTplDemoUrl,
      coverImage: newTplImage || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
      description: newTplDesc || 'Bespoke digital wedding invitation with interactive maps and RSVP.',
      category: ['Modern', 'Luxury'],
      features: ['Countdown Clock', 'Google Maps Route', 'Instant RSVP', 'Photo Highlights']
    };

    addTemplate(newTemplate);
    setShowAddTemplate(false);
    setNewTplId('');
    setNewTplName('');
    setNewTplDemoUrl('');
    setNewTplDesc('');
  };

  const exportEnquiriesCsv = () => {
    if (enquiries.length === 0) return;
    const headers = ['ID', 'Date', 'Name', 'WhatsApp', 'Event Type', 'Event Date', 'Package', 'Template', 'Message'];
    const rows = enquiries.map((enq) => [
      enq.id,
      enq.createdAt,
      `"${enq.name}"`,
      `"${enq.whatsapp}"`,
      `"${enq.eventType}"`,
      `"${enq.eventDate}"`,
      `"${enq.selectedPackage}"`,
      `"${enq.templateId || ''}"`,
      `"${enq.message.replace(/"/g, '""')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `velora_enquiries_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-hidden">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-[#231812]/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-5xl h-[90vh] bg-[#F8F3EC] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-[#C6A16B]/30 z-10"
      >
        {/* Header */}
        <div className="bg-[#34251D] text-[#F8F3EC] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#C6A16B] text-[#34251D] flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-medium tracking-wide">
                VELORA Owner Content Manager
              </h3>
              <p className="text-[11px] text-[#EFE5D8]/70">
                Manage templates, prices, customer enquiries & contact information
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        {!isAuthenticated ? (
          /* Authentication Screen */
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-[#EFE5D8] border border-[#C6A16B]/30 flex items-center justify-center text-[#C6A16B] mb-4">
              <Lock className="w-8 h-8" />
            </div>
            <h4 className="font-serif text-2xl text-[#34251D] mb-1">
              Admin Access Required
            </h4>
            <p className="text-xs text-[#7E6F64] mb-6">
              Enter your owner passcode to manage customer submissions, prices and template listings. (Default: <code className="bg-[#EFE5D8] px-1 py-0.5 rounded text-[#34251D] font-mono">velora2026</code>)
            </p>

            <form onSubmit={handleLogin} className="w-full space-y-3">
              <input
                type="password"
                placeholder="Enter owner passcode"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#C6A16B]/40 text-center text-sm bg-white text-[#34251D] focus:outline-none focus:ring-2 focus:ring-[#C6A16B]"
                autoFocus
              />

              {authError && (
                <p className="text-xs text-rose-600 font-medium">
                  Incorrect passcode. Please try again.
                </p>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-full bg-[#34251D] hover:bg-[#C6A16B] text-[#F8F3EC] text-xs uppercase tracking-widest font-medium transition-colors shadow"
              >
                Unlock Dashboard
              </button>
            </form>
          </div>
        ) : (
          /* Dashboard Main Area */
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Dashboard Tabs */}
            <div className="bg-[#EFE5D8] px-6 py-2 border-b border-[#C6A16B]/20 flex items-center gap-3 overflow-x-auto text-xs no-scrollbar">
              <button
                onClick={() => setActiveTab('enquiries')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  activeTab === 'enquiries'
                    ? 'bg-[#34251D] text-[#F8F3EC]'
                    : 'text-[#514338] hover:bg-white/60'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-[#C6A16B]" />
                <span>Customer Enquiries ({enquiries.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('templates')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  activeTab === 'templates'
                    ? 'bg-[#34251D] text-[#F8F3EC]'
                    : 'text-[#514338] hover:bg-white/60'
                }`}
              >
                <LayoutTemplate className="w-3.5 h-3.5 text-[#C6A16B]" />
                <span>Wedding Templates ({templates.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('pricing')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  activeTab === 'pricing'
                    ? 'bg-[#34251D] text-[#F8F3EC]'
                    : 'text-[#514338] hover:bg-white/60'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5 text-[#C6A16B]" />
                <span>Package Pricing</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  activeTab === 'settings'
                    ? 'bg-[#34251D] text-[#F8F3EC]'
                    : 'text-[#514338] hover:bg-white/60'
                }`}
              >
                <Settings className="w-3.5 h-3.5 text-[#C6A16B]" />
                <span>Brand & WhatsApp Settings</span>
              </button>

              <button
                onClick={() => setActiveTab('supabase')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  activeTab === 'supabase'
                    ? 'bg-[#34251D] text-[#F8F3EC]'
                    : 'text-[#514338] hover:bg-white/60'
                }`}
              >
                <Database className="w-3.5 h-3.5 text-[#C6A16B]" />
                <span>Supabase Integration</span>
              </button>
            </div>

            {/* Tab Panels */}
            <div className="flex-1 p-6 overflow-y-auto">
              
              {/* TAB 1: CUSTOMER ENQUIRIES */}
              {activeTab === 'enquiries' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="font-serif text-xl text-[#34251D]">
                        Recent Customer Enquiries ({enquiries.length})
                      </h4>
                      <p className="text-xs text-[#7E6F64]">
                        Private customer leads submitted via your website contact form.
                      </p>
                    </div>

                    {enquiries.length > 0 && (
                      <button
                        onClick={exportEnquiriesCsv}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-[#C6A16B]/40 text-xs font-medium text-[#34251D] hover:bg-white"
                      >
                        <Download className="w-3.5 h-3.5 text-[#C6A16B]" />
                        <span>Export CSV</span>
                      </button>
                    )}
                  </div>

                  {enquiries.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-[#C6A16B]/30 p-8">
                      <Users className="w-8 h-8 text-[#C6A16B] mx-auto mb-2 opacity-50" />
                      <p className="text-xs text-[#7E6F64]">
                        No enquiries received yet. Submissions from the contact form will automatically appear here.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl border border-[#C6A16B]/25 overflow-hidden shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-[#EFE5D8]/70 text-[#34251D] font-serif uppercase tracking-wider text-[10px]">
                            <tr>
                              <th className="p-3">Ref ID</th>
                              <th className="p-3">Name</th>
                              <th className="p-3">WhatsApp</th>
                              <th className="p-3">Event</th>
                              <th className="p-3">Date</th>
                              <th className="p-3">Package</th>
                              <th className="p-3">Message</th>
                              <th className="p-3">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#C6A16B]/15 text-[#514338]">
                            {enquiries.map((enq) => (
                              <tr key={enq.id} className="hover:bg-[#F8F3EC]/50">
                                <td className="p-3 font-mono font-semibold text-[#34251D]">
                                  {enq.id}
                                </td>
                                <td className="p-3 font-medium text-[#34251D]">
                                  {enq.name}
                                </td>
                                <td className="p-3">
                                  <a
                                    href={`https://wa.me/${enq.whatsapp.replace(/[^0-9]/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-emerald-700 hover:underline flex items-center gap-1"
                                  >
                                    <Phone className="w-3 h-3" />
                                    <span>{enq.whatsapp}</span>
                                  </a>
                                </td>
                                <td className="p-3">{enq.eventType}</td>
                                <td className="p-3">{enq.eventDate || '—'}</td>
                                <td className="p-3">
                                  <span className="px-2 py-0.5 rounded bg-[#EFE5D8] text-[10px] text-[#34251D]">
                                    {enq.selectedPackage}
                                  </span>
                                </td>
                                <td className="p-3 max-w-[200px] truncate" title={enq.message}>
                                  {enq.message || '—'}
                                </td>
                                <td className="p-3">
                                  <a
                                    href={`https://wa.me/${enq.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${enq.name}! Thank you for enquiring with Velora about your ${enq.eventType}. I would love to help you customize your digital invitation!`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-2.5 py-1 rounded-full bg-[#34251D] text-[#F8F3EC] text-[10px] hover:bg-[#C6A16B] transition-colors inline-flex items-center gap-1"
                                  >
                                    <span>Reply</span>
                                  </a>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: WEDDING TEMPLATES MANAGEMENT */}
              {activeTab === 'templates' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="font-serif text-xl text-[#34251D]">
                        Wedding Templates Portfolio ({templates.length})
                      </h4>
                      <p className="text-xs text-[#7E6F64]">
                        All live templates across collections A through E.
                      </p>
                    </div>

                    <button
                      onClick={() => setShowAddTemplate(!showAddTemplate)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#34251D] text-[#F8F3EC] text-xs font-medium uppercase tracking-wider hover:bg-[#C6A16B] transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#C6A16B]" />
                      <span>Add New Template</span>
                    </button>
                  </div>

                  {/* Add New Template Form */}
                  {showAddTemplate && (
                    <form onSubmit={handleCreateTemplate} className="bg-white p-5 rounded-2xl border border-[#C6A16B]/40 shadow-md space-y-4">
                      <h5 className="font-serif text-base text-[#34251D]">Add New Wedding Template</h5>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[10px] uppercase font-semibold text-[#7E6F64] block mb-1">
                            Template ID (e.g. F1) *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. F1"
                            value={newTplId}
                            onChange={(e) => setNewTplId(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg border border-[#C6A16B]/30 text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-semibold text-[#7E6F64] block mb-1">
                            Couple Names *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Rahul & Tanya"
                            value={newTplName}
                            onChange={(e) => setNewTplName(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg border border-[#C6A16B]/30 text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-semibold text-[#7E6F64] block mb-1">
                            Collection Tier
                          </label>
                          <select
                            value={newTplCollection}
                            onChange={(e) => {
                              const col = e.target.value as CollectionTier;
                              setNewTplCollection(col);
                              if (col === 'A') setNewTplPrice(499);
                              if (col === 'B') setNewTplPrice(799);
                              if (col === 'C') setNewTplPrice(999);
                              if (col === 'D') setNewTplPrice(1499);
                              if (col === 'E') setNewTplPrice(1999);
                            }}
                            className="w-full px-3 py-1.5 rounded-lg border border-[#C6A16B]/30 text-xs"
                          >
                            <option value="A">Collection A (₹499)</option>
                            <option value="B">Collection B (₹799)</option>
                            <option value="C">Collection C (₹999)</option>
                            <option value="D">Collection D (₹1,499)</option>
                            <option value="E">Collection E (₹1,999)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] uppercase font-semibold text-[#7E6F64] block mb-1">
                            Live Demo URL (Vercel) *
                          </label>
                          <input
                            type="url"
                            required
                            placeholder="https://your-template.pages.dev"
                            value={newTplDemoUrl}
                            onChange={(e) => setNewTplDemoUrl(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg border border-[#C6A16B]/30 text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-semibold text-[#7E6F64] block mb-1">
                            Cover Image URL
                          </label>
                          <input
                            type="url"
                            placeholder="https://images.unsplash.com/..."
                            value={newTplImage}
                            onChange={(e) => setNewTplImage(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg border border-[#C6A16B]/30 text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] uppercase font-semibold text-[#7E6F64] block mb-1">
                          Short Description
                        </label>
                        <input
                          type="text"
                          placeholder="Describe the aesthetic and tone..."
                          value={newTplDesc}
                          onChange={(e) => setNewTplDesc(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-[#C6A16B]/30 text-xs"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-full bg-[#34251D] text-white text-xs font-medium uppercase tracking-wider hover:bg-[#C6A16B]"
                        >
                          Save & Publish
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAddTemplate(false)}
                          className="px-4 py-2 rounded-full border border-gray-300 text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Templates Table */}
                  <div className="bg-white rounded-2xl border border-[#C6A16B]/25 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto max-h-[460px] overflow-y-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#EFE5D8]/70 text-[#34251D] font-serif uppercase tracking-wider text-[10px] sticky top-0 z-10">
                          <tr>
                            <th className="p-3">ID</th>
                            <th className="p-3">Couple / Title</th>
                            <th className="p-3">Collection</th>
                            <th className="p-3">Price</th>
                            <th className="p-3">Demo Link</th>
                            <th className="p-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#C6A16B]/15 text-[#514338]">
                          {templates.map((tpl) => (
                            <tr key={tpl.id} className="hover:bg-[#F8F3EC]/50">
                              <td className="p-3 font-mono font-bold text-[#34251D]">
                                {tpl.id}
                              </td>
                              <td className="p-3 font-medium text-[#34251D]">
                                {tpl.name}
                              </td>
                              <td className="p-3">
                                <span className="px-2 py-0.5 rounded bg-[#EFE5D8] text-[10px]">
                                  {tpl.collectionName}
                                </span>
                              </td>
                              <td className="p-3 font-semibold text-[#34251D]">
                                ₹{tpl.price}
                              </td>
                              <td className="p-3">
                                <a
                                  href={tpl.demoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#C6A16B] hover:underline flex items-center gap-1 truncate max-w-[200px]"
                                >
                                  <span>{tpl.demoUrl.replace('https://', '')}</span>
                                  <ExternalLink className="w-2.5 h-2.5 flex-shrink-0" />
                                </a>
                              </td>
                              <td className="p-3 text-right">
                                <button
                                  onClick={() => deleteTemplate(tpl.id)}
                                  className="p-1 rounded text-rose-600 hover:bg-rose-50"
                                  title="Delete Template"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: PACKAGE PRICING */}
              {activeTab === 'pricing' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-serif text-xl text-[#34251D]">
                      Package Pricing Configuration
                    </h4>
                    <p className="text-xs text-[#7E6F64]">
                      Update prices instantly. Changes take effect on the customer pricing cards immediately.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {packages.map((pkg) => (
                      <div
                        key={pkg.id}
                        className="bg-white p-5 rounded-2xl border border-[#C6A16B]/30 shadow-sm space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-serif uppercase tracking-wider text-[#C6A16B] font-semibold">
                            {pkg.collectionCode} Collection
                          </span>
                          <span className="text-[11px] font-mono text-[#7E6F64]">
                            {pkg.deliveryTime}
                          </span>
                        </div>

                        <h5 className="font-serif text-lg text-[#34251D]">
                          {pkg.name}
                        </h5>

                        <div className="flex items-center gap-2">
                          <span className="text-sm font-serif text-[#C6A16B]">₹</span>
                          <input
                            type="number"
                            value={pkg.price}
                            onChange={(e) => updatePackagePrice(pkg.id, Number(e.target.value))}
                            className="w-28 px-3 py-1.5 rounded-lg border border-[#C6A16B]/40 text-base font-serif font-semibold text-[#34251D]"
                          />
                        </div>

                        <p className="text-[11px] text-[#7E6F64] line-clamp-2">
                          {pkg.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: BRAND & WHATSAPP SETTINGS */}
              {activeTab === 'settings' && (
                <div className="space-y-6 max-w-2xl">
                  <div>
                    <h4 className="font-serif text-xl text-[#34251D]">
                      Brand & Contact Configuration
                    </h4>
                    <p className="text-xs text-[#7E6F64]">
                      Configure your real WhatsApp Business phone number and Instagram profile.
                    </p>
                  </div>

                  <form onSubmit={handleSaveSettings} className="bg-white p-6 rounded-2xl border border-[#C6A16B]/30 shadow-sm space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-[#34251D] flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[#C6A16B]" />
                        <span>Owner's WhatsApp Business Number (with Country Code) *</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={whatsappInput}
                        onChange={(e) => setWhatsappInput(e.target.value)}
                        placeholder="e.g. 918075304905"
                        className="w-full px-3.5 py-2 rounded-xl text-xs border border-[#C6A16B]/40 text-[#34251D]"
                      />
                      <p className="text-[11px] text-[#7E6F64]">
                        Enter digits without '+' or dashes. Used for every "Choose This Template" and WhatsApp chat button.
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-[#34251D] flex items-center gap-1.5">
                        <Instagram className="w-3.5 h-3.5 text-[#C6A16B]" />
                        <span>Instagram Profile Handle *</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={instaInput}
                        onChange={(e) => setInstaInput(e.target.value)}
                        placeholder="@velora__in_"
                        className="w-full px-3.5 py-2 rounded-xl text-xs border border-[#C6A16B]/40 text-[#34251D]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-[#34251D]">
                        Brand Tagline
                      </label>
                      <input
                        type="text"
                        value={taglineInput}
                        onChange={(e) => setTaglineInput(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl text-xs border border-[#C6A16B]/40 text-[#34251D]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-[#34251D]">
                        Contact Email
                      </label>
                      <input
                        type="email"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl text-xs border border-[#C6A16B]/40 text-[#34251D]"
                      />
                    </div>

                    <div className="pt-2 flex items-center gap-3">
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#34251D] text-[#F8F3EC] text-xs font-medium uppercase tracking-wider hover:bg-[#C6A16B] transition-colors shadow"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Configuration</span>
                      </button>

                      {savedNotice && (
                        <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Settings saved successfully!</span>
                        </span>
                      )}
                    </div>
                  </form>

                  {/* Reset defaults */}
                  <div className="pt-4 border-t border-[#C6A16B]/20 flex items-center justify-between">
                    <span className="text-xs text-[#7E6F64]">
                      Reset website data back to factory defaults:
                    </span>
                    <button
                      onClick={() => {
                        if (confirm('Reset templates and settings to initial values?')) {
                          resetToDefaults();
                          alert('Data reset to default.');
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset to Defaults</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 5: SUPABASE INTEGRATION */}
              {activeTab === 'supabase' && (
                <div className="space-y-4 max-w-2xl bg-white p-6 rounded-2xl border border-[#C6A16B]/30 shadow-sm">
                  <div className="flex items-center gap-3">
                    <Database className="w-6 h-6 text-[#C6A16B]" />
                    <h4 className="font-serif text-xl text-[#34251D]">
                      Supabase Cloud Database & Auth
                    </h4>
                  </div>
                  <p className="text-xs text-[#514338] leading-relaxed">
                    VELORA currently stores enquiry submissions and configuration safely in the browser's local state. When you want cloud synchronization across multiple admin devices, plug your Supabase credentials into your <code className="bg-[#EFE5D8] px-1 py-0.5 rounded font-mono text-[#34251D]">.env</code> file:
                  </p>
                  
                  <div className="bg-[#231812] text-[#F8F3EC] p-4 rounded-xl text-xs font-mono space-y-1">
                    <p className="text-[#C6A16B]"># Add to .env file in root:</p>
                    <p>VITE_SUPABASE_URL=https://your-project.supabase.co</p>
                    <p>VITE_SUPABASE_ANON_KEY=your-anon-public-key</p>
                  </div>

                  <div className="pt-2">
                    <p className="text-xs text-[#7E6F64]">
                      All customer submissions and enquiry tables are ready to bind with Supabase REST endpoints.
                    </p>
                  </div>
                </div>
              )}

            </div>

          </div>
        )}

      </motion.div>
    </div>
  );
};

