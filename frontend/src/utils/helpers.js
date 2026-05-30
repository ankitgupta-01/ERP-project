export function numberToWords(num) {
  if (!num || num === 0) return 'Zero Rupees Only';
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function inWords(n) {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : '');
    if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + inWords(n % 100) : '');
    if (n < 100000) return inWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + inWords(n % 1000) : '');
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + inWords(n % 100000) : '');
    return inWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + inWords(n % 10000000) : '');
  }

  const rupees = Math.floor(num);
  const paise = Math.round((num - rupees) * 100);
  let result = inWords(rupees) + ' Rupees';
  if (paise > 0) result += ' and ' + inWords(paise) + ' Paise';
  return result + ' Only';
}

export function formatCurrency(num) {
  if (!num && num !== 0) return '—';
  return new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export const PER_OPTIONS = ['SFT', 'SQM', 'NOS', 'UNIT', 'RFT', 'KG', 'SET', 'LOT'];
export const UNIT_OPTIONS = ['ft', 'cm', 'mm', 'm', 'inch'];

export const DEFAULT_COMPANY = {
  name: 'JAYNATH ALUMINIUM & ROOFING SYSTEM',
  address: '23/23 SUN PLAZA (1) NEAR VADASAR BRIDGE GIDC MAKARPURA, VADAODARA, GUJARAT 390010',
  gstin: '24AHSPG0673J1Z5',
  phone: '9376220257, 9408825084',
  email: 'jars.vadodara@gmail.com',
  logo: '',
};

export const DEFAULT_ITEM = () => ({
  id: Date.now() + Math.random(),
  description: '',
  hsnSacCode: '',
  sizeA: '',
  sizeB: '',
  sizeUnit: 'ft',
  qty: '',
  nos: 1,
  per: 'SFT',
  rate: '',
  amount: 0,
});