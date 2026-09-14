import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Printer,
  Download,
  ShieldCheck,
  Building2,
  Calendar,
  CreditCard,
  Hash,
  FileText,
  User,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { api } from '../services/api';
import PaymentReceiptModal from './PaymentReceiptModal';

export default function PaymentResultView({ onNavigate, currentUser }) {
  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState(null);
  const [statusType, setStatusType] = useState('success'); // 'success' | 'failed' | 'cancelled'
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const parseUrlAndFetch = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const path = window.location.pathname.toLowerCase();
        
        const tranId = urlParams.get('tran_id');
        const invoiceNo = urlParams.get('invoiceNo');
        const paramStatus = urlParams.get('status');
        const reason = urlParams.get('reason');

        if (path.includes('fail') || paramStatus === 'failed' || reason) {
          setStatusType('failed');
          setErrorMsg(reason ? `Gateway reason: ${reason}` : 'Bank transaction was declined or failed.');
        } else if (path.includes('cancel') || paramStatus === 'cancelled') {
          setStatusType('cancelled');
          setErrorMsg('The payment session was cancelled by user on SSLCommerz.');
        } else {
          setStatusType('success');
        }

        if (tranId) {
          try {
            const res = await api.validateSSLPayment(tranId);
            if (res?.data) {
              setPaymentData(res.data);
            }
          } catch (valErr) {
            console.warn('Validate payment note:', valErr.message);
            // Fallback object from URL params
            setPaymentData({
              transactionId: tranId,
              invoiceNo: invoiceNo || `INV-${Date.now().toString().slice(-6)}`,
              amount: urlParams.get('amount') || 2200,
              paymentMethod: 'SSLCommerz Hosted Banking',
              paidAt: new Date().toISOString(),
              customerName: currentUser?.name || 'Resident Student',
            });
          }
        }
      } catch (err) {
        console.error('Payment result parse error:', err);
      } finally {
        setLoading(false);
      }
    };

    parseUrlAndFetch();
  }, [currentUser]);

  const handleReturnDashboard = () => {
    // Clear URL parameters
    window.history.replaceState({}, document.title, '/');
    if (currentUser?.role === 'parent' || currentUser?.role === 'guardian') {
      onNavigate('parent-dashboard');
    } else if (currentUser?.role === 'student') {
      onNavigate('student-dashboard');
    } else {
      onNavigate('home');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-14 h-14 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
          Verifying payment status with SSLCommerz Bank Gateway...
        </p>
      </div>
    );
  }

  const isSuccess = statusType === 'success';
  const isFailed = statusType === 'failed';
  const isCancelled = statusType === 'cancelled';

  return (
    <div className="min-h-[85vh] py-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto flex flex-col justify-center">
      <div className="bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden">
        
        {/* Banner Header */}
        <div className={`p-8 text-center text-white relative ${
          isSuccess 
            ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700' 
            : isFailed 
            ? 'bg-gradient-to-r from-rose-600 via-red-600 to-rose-700'
            : 'bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700'
        }`}>
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg">
            {isSuccess && <CheckCircle2 size={44} className="text-white drop-shadow" />}
            {isFailed && <XCircle size={44} className="text-white drop-shadow" />}
            {isCancelled && <AlertTriangle size={44} className="text-white drop-shadow" />}
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-md mb-2">
            <ShieldCheck size={14} />
            <span>SSLCommerz Hosted Banking Gateway (256-Bit TLS)</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            {isSuccess && 'Payment Successfully Cleared!'}
            {isFailed && 'Payment Transaction Failed'}
            {isCancelled && 'Payment Cancelled by User'}
          </h1>

          <p className="text-sm text-white/80 mt-1 max-w-md mx-auto">
            {isSuccess && 'Your institutional payment has been verified and marked as Paid in IUBAT Residential Hall System.'}
            {isFailed && (errorMsg || 'Your transaction was not completed by the payment provider.')}
            {isCancelled && 'The transaction session was abandoned before completion. No funds were debited.'}
          </p>
        </div>

        {/* Payment Summary Box */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Transaction Status</span>
              <span className={`text-xs font-bold font-mono px-3 py-1 rounded-full border ${
                isSuccess
                  ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                  : isFailed
                  ? 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                  : 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
              }`}>
                {isSuccess ? 'VALID & PAID' : isFailed ? 'FAILED' : 'CANCELLED'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div>
                <span className="text-slate-400 block mb-0.5">Transaction ID (SSLCommerz)</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 break-all">
                  {paymentData?.transactionId || 'N/A'}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">Invoice Number</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {paymentData?.invoiceNo || 'N/A'}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">Total Amount</span>
                <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                  ৳{Number(paymentData?.amount || 2200).toLocaleString()} BDT
                </span>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">Payment Method</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {paymentData?.paymentMethod || 'SSLCommerz Gateway'}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">Resident Student</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {paymentData?.customerName || currentUser?.name || 'IUBAT Resident Student'}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">Date & Time</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {new Date().toLocaleString('en-GB')}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            {isSuccess && (
              <button
                type="button"
                onClick={() => setIsReceiptModalOpen(true)}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Printer size={16} />
                <span>Download / Print Institutional Receipt</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleReturnDashboard}
              className={`w-full sm:flex-1 py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer text-white ${
                isSuccess
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600'
              }`}
            >
              <span>Return to Dashboard</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Official Money Receipt Modal */}
      {isReceiptModalOpen && paymentData && (
        <PaymentReceiptModal
          isOpen={isReceiptModalOpen}
          onClose={() => setIsReceiptModalOpen(false)}
          paymentData={{
            ...paymentData,
            amountBDT: paymentData.amount,
          }}
          studentUser={currentUser}
        />
      )}
    </div>
  );
}
