import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin, 
  AlertCircle, 
  CheckCircle2, 
  FileText, 
  ShieldCheck, 
  RotateCcw,
  Sparkles,
  Building2,
  Lock,
  Globe,
  Clock
} from 'lucide-react';
import { BrandLogo } from './Logo';

interface ComplianceViewProps {
  type: 'terms' | 'privacy' | 'refund' | 'contact';
  onBack: () => void;
  onNavigate?: (path: string) => void;
}

export default function ComplianceView({ type, onBack, onNavigate }: ComplianceViewProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setName('');
      setEmail('');
      setMessage('');
    }, 1200);
  };

  const pageTitles = {
    terms: 'Terms of Service',
    privacy: 'Privacy Policy',
    refund: 'Refund & Cancellations',
    contact: 'Contact Us & Corporate Support'
  };

  const pageIcons = {
    terms: <FileText className="w-10 h-10 text-blue-600 stroke-[1.8]" />,
    privacy: <ShieldCheck className="w-10 h-10 text-emerald-600 stroke-[1.8]" />,
    refund: <RotateCcw className="w-10 h-10 text-amber-500 stroke-[1.8]" />,
    contact: <Mail className="w-10 h-10 text-purple-600 stroke-[1.8]" />
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col text-slate-800" id={`compliance-${type}-page`}>
      {/* Premium Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 px-4 py-3 sm:px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 -ml-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
              aria-label="Go back"
              id="compliance-back-btn"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
            </button>
            <div className="h-6 w-[1px] bg-slate-200" />
            <div 
              onClick={() => onNavigate ? onNavigate('/shop') : onBack()} 
              className="cursor-pointer"
            >
              <BrandLogo size="sm" />
            </div>
          </div>
          
          <button
            onClick={() => onNavigate ? onNavigate('/shop') : onBack()}
            className="text-xs font-bold text-[#143C6B] hover:text-[#0C2340] border border-slate-200 hover:border-slate-300 rounded-xl px-4 py-2 bg-white shadow-3xs cursor-pointer transition-colors"
          >
            Enter Storefront
          </button>
        </div>
      </header>

      {/* Hero Header Area */}
      <div className="bg-white border-b border-slate-100 py-10 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <div className="inline-flex p-3 rounded-2xl bg-slate-50 border border-slate-100 shadow-3xs mx-auto">
            {pageIcons[type]}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-display">
            {pageTitles[type]}
          </h1>
          <p className="text-xs text-slate-500 font-bold max-w-lg mx-auto leading-relaxed">
            Official legal documentation for QueKart's retail commerce and merchant exchange networks.
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 sm:p-10">
          
          {type === 'contact' && (
            <div className="space-y-8" id="compliance-contact-content">
              <div className="prose prose-slate max-w-none">
                <p className="text-sm text-slate-600 leading-relaxed font-semibold">
                  Our customer grievance officer and seller registration helpdesks are active 24/7 to resolve transactional queries, logistics compliance, and catalogue ticket disputes immediately. Please reach out to us using the official channels or message form below.
                </p>
              </div>

              {/* Grid of contact widgets */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-100 flex items-start gap-3">
                  <div className="p-2.5 bg-blue-50 text-blue-700 rounded-lg">
                    <Mail className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">SUPPORT EMAIL</span>
                    <a href="mailto:support@quekart.com" className="text-xs font-black text-blue-700 hover:underline block mt-1">support@quekart.com</a>
                    <span className="text-[10px] text-slate-400 font-semibold block mt-1">Response inside 2 hours</span>
                  </div>
                </div>

                <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-100 flex items-start gap-3">
                  <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-lg">
                    <Phone className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">CUSTOMER HELPLINE</span>
                    <a href="tel:+911412891000" className="text-xs font-black text-emerald-700 hover:underline block mt-1">+91 141-289-1000</a>
                    <span className="text-[10px] text-slate-400 font-semibold block mt-1">Available 24/7 (Toll-Free)</span>
                  </div>
                </div>

                <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-100 flex items-start gap-3">
                  <div className="p-2.5 bg-amber-50 text-amber-700 rounded-lg">
                    <MapPin className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">REGISTERED HQ</span>
                    <span className="text-xs font-black text-slate-800 block mt-1">Surat & Jaipur Hub Nodes</span>
                    <span className="text-[10px] text-slate-400 font-semibold block mt-1">Pasi E-Commerce Services</span>
                  </div>
                </div>
              </div>

              {/* Interactive Submit Ticket form */}
              <div className="border-t border-slate-100 pt-8">
                <div className="max-w-xl">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-2">
                    Instant Corporate Message Desk
                  </h3>
                  <p className="text-[11px] text-slate-500 font-semibold mb-6">
                    Submit your query, merchant application, or order grievance directly to our administrative dispatch desk.
                  </p>

                  {isSubmitted ? (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-5 rounded-2xl flex items-start gap-3 animate-fadeIn" id="contact-success-alert">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <span className="font-black text-xs block">Ticket Raised Successfully!</span>
                        <p className="text-[11px] text-slate-600 font-semibold leading-relaxed">
                          Your ticket ID has been generated in our system. A grievance desk representative will reach out on your registered email address shortly. Thank you for choosing QueKart!
                        </p>
                        <button
                          onClick={() => setIsSubmitted(false)}
                          className="text-[11px] font-black text-emerald-700 hover:text-emerald-900 underline mt-2 block"
                        >
                          Submit Another Ticket
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-500 font-black uppercase tracking-wider block">Full Name</label>
                          <input 
                            type="text" 
                            required
                            placeholder="e.g. Gaurav Beniwal"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-slate-50/50 border border-slate-200 focus:border-[#143C6B] focus:bg-white text-xs font-medium p-3 rounded-xl focus:outline-hidden transition-all"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-500 font-black uppercase tracking-wider block">Email Address</label>
                          <input 
                            type="email" 
                            required
                            placeholder="e.g. name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-50/50 border border-slate-200 focus:border-[#143C6B] focus:bg-white text-xs font-medium p-3 rounded-xl focus:outline-hidden transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 font-black uppercase tracking-wider block">Details of your Query</label>
                        <textarea 
                          rows={4}
                          required
                          placeholder="Please provide order IDs, vendor details, or registration context to expedite processing..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          className="w-full bg-slate-50/50 border border-slate-200 focus:border-[#143C6B] focus:bg-white text-xs font-medium p-3 rounded-xl focus:outline-hidden transition-all resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-[#143C6B] hover:bg-[#0C2340] text-white text-xs font-black px-6 py-3 rounded-xl active:scale-[0.99] transition-all cursor-pointer shadow-sm w-full sm:w-auto"
                      >
                        {isSubmitting ? 'Raising Ticket...' : 'Submit Support Ticket'}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          )}

          {type === 'refund' && (
            <div className="space-y-6 text-xs text-slate-600 font-semibold leading-relaxed" id="compliance-refund-content">
              {/* Highlight card */}
              <div className="flex items-start gap-3 text-amber-800 bg-amber-50/70 border border-amber-200 p-4 rounded-xl">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
                <div className="space-y-1 text-[11px]">
                  <span className="font-black text-slate-900 block">Important Customer Guarantee</span>
                  We operate on a <strong>No Questions Asked 7-Day Returns & Exchanges Policy</strong> across all approved categories on our application.
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <h3 className="text-slate-900 font-black uppercase text-xs tracking-wider">1. Scope of Returns & Exchanges</h3>
                  <p>
                    QueKart allows direct returns or voluntary exchanges of products purchased via the retail customer panel within 7 calendar days from the actual delivery timestamp. All packages must remain in original unused merchant condition with brand tags fully attached.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-slate-900 font-black uppercase text-xs tracking-wider">2. Payout Returns Procedure</h3>
                  <p>
                    Once our logistics courier partner retrieves the returned packet from your designated shipping address, the physical stock is automatically verified in our Surat/Jaipur hub nodes. Payouts are generated back within 24-48 business hours directly to your designated bank account, UPI ID, or original billing instrument.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-slate-900 font-black uppercase text-xs tracking-wider">3. Reverse Pickup Service Fee</h3>
                  <p>
                    Reverse shipping is completely sponsored and free of cost for products reported with packaging defects or incorrect dispatches. For voluntary returns due to size preferences or style changes, a standard reverse courier facilitation ledger rate of ₹39 may apply.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-slate-900 font-black uppercase text-xs tracking-wider">4. Damaged or Tampered Shipments</h3>
                  <p>
                    Customers are advised never to accept shipments with tampered seals or outer tape damage. For any missing item claims, please share a clear unboxing video or photographs with our Customer Support within 24 hours of delivery.
                  </p>
                </div>
              </div>
            </div>
          )}

          {type === 'terms' && (
            <div className="space-y-6 text-xs text-slate-600 font-semibold leading-relaxed" id="compliance-terms-content">
              <div className="flex items-center gap-2 text-slate-400 font-mono text-[10px] border-b border-slate-100 pb-4">
                <Clock className="w-3.5 h-3.5" />
                <span>Last Updated: August 20, 2026</span>
                <span className="mx-2">•</span>
                <Globe className="w-3.5 h-3.5" />
                <span>Applicable jurisdiction: Republic of India</span>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <h3 className="text-slate-900 font-black uppercase text-xs tracking-wider">1. Agreement to Terms</h3>
                  <p>
                    By visiting our storefront, registering as an active wholesale merchant, or using our demo OTP systems, you represent and warrant that you hold legal authority to engage under Indian Business & E-Commerce Law guidelines.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-slate-900 font-black uppercase text-xs tracking-wider">2. Zero Commission Marketplace Model</h3>
                  <p>
                    QueKart acts as a direct-to-retail facilitation system. We do not extract commissions on supplier payout transactions. Vendors are directly liable for catalog accuracy, fabric grade certifications, and dispatch compliance.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-slate-900 font-black uppercase text-xs tracking-wider">3. Prohibited Merchant Activities</h3>
                  <p>
                    Merchant listings containing counterfeit labels, copy-pasted copyright imagery, misleading MRP price points, or duplicate listings are automatically flagged by our systems and sent to administration blocks immediately.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-slate-900 font-black uppercase text-xs tracking-wider">4. Account and Security</h3>
                  <p>
                    All users are responsible for keeping their mobile numbers, profiles, and local session details secure. Simulated OTP logins are designed for demonstration and developer feedback. Any unauthorized usage should be reported immediately.
                  </p>
                </div>
              </div>
            </div>
          )}

          {type === 'privacy' && (
            <div className="space-y-6 text-xs text-slate-600 font-semibold leading-relaxed" id="compliance-privacy-content">
              <div className="flex items-center gap-2 text-slate-400 font-mono text-[10px] border-b border-slate-100 pb-4">
                <Lock className="w-3.5 h-3.5" />
                <span>Information Security Officer Ledger (2026 Revision)</span>
                <span className="mx-2">•</span>
                <Building2 className="w-3.5 h-3.5" />
                <span>ISO 27001 Compliant Framework</span>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <h3 className="text-slate-900 font-black uppercase text-xs tracking-wider">1. User Data Ownership & Integrity</h3>
                  <p>
                    QueKart enforces standard secure encryption hashes. We never share customer contact numbers, delivery addresses, billing sheets, or catalog analytics with third-party marketing brokers.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-slate-900 font-black uppercase text-xs tracking-wider">2. Cookie & Tracking Protocols</h3>
                  <p>
                    We use limited cookie protocols to persist active client session logs (such as cart lists, user login states, and active checkout pathways). These coordinates stay encrypted on your local device.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-slate-900 font-black uppercase text-xs tracking-wider">3. Government GSTIN Ledgers</h3>
                  <p>
                    All merchant GST registration documents verified on the supplier panel are securely cross-checked with the Government GSTN systems through secured proxy servers and are permanently locked against unauthorized modifications to prevent transactional fraud.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-slate-900 font-black uppercase text-xs tracking-wider">4. Data Erasure Rights</h3>
                  <p>
                    Customers can request permanent profile erasure or transaction database archiving at any time. To execute data removal, please contact the grievance officer at support@quekart.com with your registered phone number.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Footer copyright */}
      <footer className="border-t border-slate-100 bg-white py-6 mt-12 text-center text-[11px] text-slate-400 font-medium">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>© 2026 Pasi E-Commerce Services. All Rights Reserved.</span>
          <div className="flex items-center gap-4">
            <span className="text-[10px] text-emerald-600 font-black flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Secure 256-Bit SSL Connection
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
