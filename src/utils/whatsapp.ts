export const PHONES = ['7075464984', '8106706102']
export const waLink = (text: string) => `https://wa.me/91${PHONES[0]}?text=${encodeURIComponent(text)}`
export const openWhatsApp = (text: string) => window.open(waLink(text), '_blank', 'noopener')
