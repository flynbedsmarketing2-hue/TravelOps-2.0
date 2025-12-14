import { PackageState } from '../types';

declare var html2pdf: any;

// Helper to convert image URL to Base64 to avoid CORS issues in PDF generation
const imageUrlToBase64 = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) throw new Error('Network response was not ok');
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn("Failed to convert image to base64 for PDF", error);
    return ""; // Return empty string if fetch fails, so PDF still generates without image
  }
};

export const generatePDF = async (pkg: PackageState, variant: 'b2b' | 'b2c') => {
  const element = document.createElement('div');
  
  // Base Settings
  element.style.width = '750px';
  element.style.maxWidth = '100%';
  element.style.boxSizing = 'border-box';
  element.style.fontFamily = 'Helvetica, Arial, sans-serif'; 
  element.style.backgroundColor = '#ffffff'; // Ensure white background
  element.style.color = '#334155';

  // Common styles
  const textBlockStyle = 'font-size: 12px; white-space: pre-wrap; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; line-height: 1.5;';
  const avoidBreak = 'page-break-inside: avoid; break-inside: avoid;';

  const formatPrice = (price: string) => {
    return price ? `${parseInt(price).toLocaleString('fr-FR')} DZD` : '-';
  };

  // Pre-process Image: Convert to Base64 if exists
  let base64Image = '';
  if (pkg.general.imageUrl) {
      base64Image = await imageUrlToBase64(pkg.general.imageUrl);
  }

  // --------------------------------------------------------------------------
  // B2B TEMPLATE: FLYNBEDS
  // Professional, Data-dense, Blue/Slate, Shows Commission
  // --------------------------------------------------------------------------
  if (variant === 'b2b') {
    const brandColor = '#0f172a'; // Slate 900
    const accentColor = '#3b82f6'; // Blue 500
    
    const pricingHtml = pkg.pricing.filter(p => p.unitPrice).map(p => `
        <tr style="border-bottom: 1px solid #e2e8f0; ${avoidBreak}">
            <td style="padding: 10px; font-size: 12px; color: #334155;">
                <div style="font-weight: bold;">${p.label}</div>
                ${p.subLabel ? `<div style="font-size: 10px; color: #64748b;">${p.subLabel}</div>` : ''}
            </td>
            <td style="padding: 10px; text-align: right; font-weight: bold; font-family: monospace; font-size: 13px;">${formatPrice(p.unitPrice)}</td>
            <td style="padding: 10px; text-align: right; font-weight: bold; font-family: monospace; font-size: 13px; color: #166534; background-color: #f0fdf4;">${formatPrice(p.commission)}</td>
        </tr>
    `).join('');

    element.innerHTML = `
        <div style="padding: 40px; background-color: #ffffff;">
            <!-- Header -->
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 4px solid ${brandColor}; padding-bottom: 20px; ${avoidBreak}">
                <div>
                    <div style="font-size: 32px; font-weight: 900; color: ${brandColor}; letter-spacing: -1px; text-transform: uppercase;">FLYNBEDS</div>
                    <div style="font-size: 11px; font-weight: bold; color: ${accentColor}; letter-spacing: 2px; text-transform: uppercase;">Partenaire B2B</div>
                </div>
                <div style="text-align: right;">
                    <h1 style="margin: 0; font-size: 18px; color: ${brandColor}; font-weight: bold;">${pkg.general.productName}</h1>
                    <div style="font-family: monospace; color: #64748b; font-size: 12px; margin-top: 5px;">REF: ${pkg.general.productCode}</div>
                    <div style="color: #64748b; font-size: 12px;">Créé le: ${pkg.general.creationDate}</div>
                </div>
            </div>

            <!-- Specs Grid -->
            <div style="display: flex; gap: 20px; margin-bottom: 30px; ${avoidBreak}">
                <div style="flex: 1; border: 1px solid #cbd5e1; border-radius: 4px; padding: 15px; background: #f8fafc;">
                    <div style="font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: bold;">Destination</div>
                    <div style="font-size: 14px; font-weight: bold; color: ${brandColor};">${pkg.destination}</div>
                    <div style="font-size: 12px; color: #475569; margin-top: 4px;">${pkg.cities.join(', ')}</div>
                </div>
                <div style="flex: 1; border: 1px solid #cbd5e1; border-radius: 4px; padding: 15px; background: #f8fafc;">
                    <div style="font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: bold;">Vols & Transport</div>
                    <div style="font-size: 12px; color: ${brandColor}; white-space: pre-wrap;">${pkg.flights[0]?.airline || '-'} (${pkg.flights[0]?.duration || '-'})</div>
                </div>
                <div style="flex: 1; border: 1px solid #cbd5e1; border-radius: 4px; padding: 15px; background: #f8fafc;">
                    <div style="font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: bold;">Visa & Transferts</div>
                    <div style="font-size: 12px; color: ${brandColor};">Visa: ${pkg.visaStatus}</div>
                    <div style="font-size: 12px; color: ${brandColor};">Transfert: ${pkg.transferStatus}</div>
                </div>
            </div>

            <!-- Content Split -->
            <div style="display: flex; gap: 40px; margin-bottom: 30px;">
                <!-- Left Column -->
                <div style="flex: 3;">
                    <h3 style="font-size: 14px; font-weight: bold; text-transform: uppercase; color: ${brandColor}; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 15px; ${avoidBreak}">Détails Techniques</h3>
                    
                    ${pkg.flights.map((f, i) => `
                        <div style="margin-bottom: 15px; ${avoidBreak}">
                            <div style="font-weight: bold; font-size: 12px; color: ${accentColor};">VOL ${i+1}</div>
                            <div style="font-size: 12px;">${f.airline} | ${f.departureDate} - ${f.returnDate}</div>
                            <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${f.details}</div>
                        </div>
                    `).join('')}

                    <div style="margin-top: 20px; ${avoidBreak}">
                        <div style="font-weight: bold; font-size: 12px; color: ${accentColor}; margin-bottom: 5px;">HÉBERGEMENT</div>
                        ${pkg.accommodations.map((h, i) => `
                            <div style="font-size: 12px; margin-bottom: 4px;">
                                <strong>${h.name}</strong> <span style="color: #64748b;">(${h.category})</span>
                            </div>
                        `).join('')}
                    </div>

                    <div style="margin-top: 20px; ${avoidBreak}">
                        <div style="font-weight: bold; font-size: 12px; color: ${accentColor}; margin-bottom: 5px;">INCLUSIONS</div>
                        <div style="${textBlockStyle}">${pkg.content.included}</div>
                    </div>
                     <div style="margin-top: 15px; ${avoidBreak}">
                        <div style="font-weight: bold; font-size: 12px; color: #ef4444; margin-bottom: 5px;">NON INCLUS</div>
                        <div style="${textBlockStyle}">${pkg.content.excluded}</div>
                    </div>
                </div>

                <!-- Right Column (Pricing) -->
                <div style="flex: 4;">
                    <h3 style="font-size: 14px; font-weight: bold; text-transform: uppercase; color: ${brandColor}; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 15px; ${avoidBreak}">Grille Tarifaire (Net & Commission)</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead style="background: #f1f5f9;">
                            <tr>
                                <th style="text-align: left; padding: 8px 10px; font-size: 10px; color: #64748b; text-transform: uppercase;">Formule</th>
                                <th style="text-align: right; padding: 8px 10px; font-size: 10px; color: #64748b; text-transform: uppercase;">Prix (DZD)</th>
                                <th style="text-align: right; padding: 8px 10px; font-size: 10px; color: #166534; text-transform: uppercase;">Comm.</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${pricingHtml}
                        </tbody>
                    </table>

                    <div style="margin-top: 30px; background: #fffbeb; border: 1px solid #fcd34d; padding: 15px; border-radius: 4px; ${avoidBreak}">
                        <div style="font-size: 11px; font-weight: bold; color: #b45309; margin-bottom: 5px;">NOTE PARTENAIRE</div>
                        <div style="font-size: 11px; color: #78350f;">
                            ${pkg.itinerary.internalNotes || 'Aucune note particulière.'}
                            <br/><br/>
                            <strong>Contact Urgence:</strong> ${pkg.itinerary.emergencyContact || '-'}
                        </div>
                    </div>
                </div>
            </div>

            <div style="text-align: center; font-size: 10px; color: #cbd5e1; margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
                Document confidentiel réservé aux partenaires Flynbeds. Ne pas diffuser au client final sans modification.
            </div>
        </div>
    `;
  }
  
  // --------------------------------------------------------------------------
  // B2C TEMPLATE: NOUBA PLUS
  // Branding: Orange (#F26522/Orange-600) & Dark Blue (#1e293b/Slate-900)
  // --------------------------------------------------------------------------
  else {
    const brandColor = '#0f172a'; // Dark Blue / Slate 900
    const accentColor = '#ea580c'; // Orange 600
    
    const pricingHtml = pkg.pricing.filter(p => p.unitPrice).map(p => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px 0; border-bottom: 1px solid #f1f5f9; ${avoidBreak}">
            <div>
                <div style="font-weight: 800; color: #1e293b; font-size: 14px; letter-spacing: 0.5px; text-transform: uppercase;">${p.label}</div>
                ${p.subLabel ? `<div style="font-size: 11px; color: #64748b; margin-top: 4px;">${p.subLabel}</div>` : ''}
            </div>
            <div style="font-weight: 800; font-size: 18px; color: ${accentColor}; font-family: 'Helvetica', sans-serif;">${formatPrice(p.unitPrice)}</div>
        </div>
    `).join('');

    // Banner Section (Hero) - Use Base64 Image
    const bannerHtml = base64Image
        ? `<div style="width: 100%; height: 450px; position: relative; margin-bottom: 0;">
            <img src="${base64Image}" style="width: 100%; height: 100%; object-fit: cover; object-position: center;" />
            <div style="position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(15, 23, 42, 0) 50%, rgba(15, 23, 42, 0.9) 100%);"></div>
            <div style="position: absolute; bottom: 50px; left: 50px; right: 50px; color: white;">
                 <div style="display: inline-block; padding: 6px 12px; background: ${accentColor}; color: white; font-size: 10px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 15px; border-radius: 2px;">${pkg.destination}</div>
                 <h1 style="margin: 0; font-size: 48px; font-weight: 800; line-height: 1.1; text-transform: uppercase; text-shadow: 0 4px 20px rgba(0,0,0,0.5);">${pkg.general.productName}</h1>
                 <div style="margin-top: 15px; font-size: 14px; opacity: 0.95; letter-spacing: 1px; font-weight: 500;">${pkg.cities.join('  •  ')}</div>
            </div>
           </div>`
        : `<div style="padding: 80px 50px 40px 50px; background: #f8fafc;"><h1 style="font-size: 48px; font-weight: 800; color: ${brandColor}; text-transform: uppercase;">${pkg.general.productName}</h1></div>`;

    // Logo Simulation using SVG
    const logoHtml = `
      <div style="display: flex; align-items: center; gap: 12px;">
         <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 100V50C10 27.9086 27.9086 10 50 10C72.0914 10 90 27.9086 90 50V100" stroke="${accentColor}" stroke-width="12" stroke-linecap="butt"/>
            <path d="M30 100V60C30 48.9543 38.9543 40 50 40C61.0457 40 70 48.9543 70 60V100" stroke="${accentColor}" stroke-width="8" stroke-linecap="butt"/>
         </svg>
         <div style="line-height: 1;">
            <div style="font-family: 'Helvetica', sans-serif; font-weight: 900; font-size: 24px; color: ${brandColor}; letter-spacing: -1px;">NOUBA PLUS</div>
            <div style="font-family: 'Helvetica', sans-serif; font-size: 9px; font-weight: 700; color: ${accentColor}; letter-spacing: 3px; text-transform: uppercase; margin-top: 2px;">Voyagez Autrement</div>
         </div>
      </div>
    `;

    element.innerHTML = `
        <div style="background-color: #ffffff;">
            ${bannerHtml}

            <div style="padding: 50px;">
                <!-- Header Brand -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 60px; border-bottom: 2px solid #f1f5f9; padding-bottom: 25px; ${avoidBreak}">
                    <div>
                        ${logoHtml}
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 12px; font-weight: 800; color: ${brandColor}; text-transform: uppercase; background: #f1f5f9; padding: 6px 12px; rounded-full;">${pkg.flights[0]?.duration || 'Séjour'}</div>
                    </div>
                </div>

                <!-- Intro / Details Split -->
                <div style="display: flex; gap: 50px; margin-bottom: 60px; ${avoidBreak}">
                <div style="flex: 3;">
                    <h3 style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: ${accentColor}; letter-spacing: 1px; margin-bottom: 15px;">L'Expérience</h3>
                    <div style="font-size: 13px; line-height: 1.9; color: #475569; text-align: justify;">
                        ${pkg.content.included.replace(/\n/g, '<br/>')}
                    </div>
                </div>
                <div style="flex: 2; border-left: 2px solid #f1f5f9; padding-left: 40px;">
                    <h3 style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: ${accentColor}; letter-spacing: 1px; margin-bottom: 15px;">Vols & Hôtels</h3>
                    
                    <!-- Flight Mini Card -->
                    <div style="margin-bottom: 25px;">
                            <div style="font-weight: 800; font-size: 14px; color: ${brandColor};">${pkg.flights[0]?.airline || '-'}</div>
                            <div style="font-size: 12px; color: #64748b; margin-top: 4px;">${pkg.flights[0]?.departureDate} ➔ ${pkg.flights[0]?.returnDate}</div>
                            <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">${pkg.flights[0]?.duration}</div>
                    </div>
                    
                    <!-- Hotels List -->
                    ${pkg.accommodations.map(h => `
                            <div style="margin-bottom: 15px;">
                                <div style="font-weight: 800; font-size: 14px; color: ${brandColor};">${h.name}</div>
                                <div style="font-size: 11px; color: ${accentColor}; font-weight: 700; margin-top: 2px;">${'★'.repeat(5)} ${h.category}</div>
                            </div>
                    `).join('')}
                </div>
                </div>

                <!-- New Section: Client Important Information -->
                ${pkg.itinerary.clientInformation ? `
                <div style="margin-bottom: 60px; ${avoidBreak}">
                    <h2 style="font-size: 16px; color: ${brandColor}; text-transform: uppercase; letter-spacing: 1px; font-weight: 800; border-bottom: 3px solid ${accentColor}; display: inline-block; padding-bottom: 5px; margin-bottom: 40px;">Informations Complémentaires</h2>
                    <div style="${textBlockStyle} font-size: 13px; color: #475569; line-height: 1.7; text-align: justify;">
                        ${pkg.itinerary.clientInformation.replace(/\n/g, '<br/>')}
                    </div>
                </div>
                ` : ''}

                <!-- Itinerary (Modern Timeline) -->
                ${pkg.itinerary.active ? `
                <div style="margin-bottom: 60px;">
                    <h2 style="font-size: 16px; color: ${brandColor}; text-transform: uppercase; letter-spacing: 1px; font-weight: 800; border-bottom: 3px solid ${accentColor}; display: inline-block; padding-bottom: 5px; margin-bottom: 40px; ${avoidBreak}">Votre Programme</h2>
                    <div style="border-left: 2px solid ${accentColor}; margin-left: 8px; padding-left: 40px;">
                        ${pkg.itinerary.days.map(d => `
                            <div style="margin-bottom: 40px; position: relative; ${avoidBreak}">
                                <div style="position: absolute; left: -46px; top: 4px; width: 10px; height: 10px; background: ${brandColor}; border-radius: 50%; box-shadow: 0 0 0 4px #fff;"></div>
                                <div style="font-family: sans-serif; font-size: 16px; font-weight: 800; color: ${brandColor}; margin-bottom: 10px; text-transform: uppercase;">Jour ${d.dayNumber}</div>
                                <div style="${textBlockStyle} font-size: 13px; color: #475569; line-height: 1.7;">${d.description.replace(/\n/g, '<br/>')}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}

                <!-- Pricing Section (Orange/Navy Theme) -->
                <div style="margin-bottom: 40px; ${avoidBreak}">
                    <div style="background: ${brandColor}; color: white; padding: 18px 30px; border-top-left-radius: 8px; border-top-right-radius: 8px; text-align: center; font-weight: 800; font-size: 18px; letter-spacing: 2px; text-transform: uppercase;">
                        Sélection Tarifaire
                    </div>
                    <div style="border: 1px solid #e2e8f0; border-top: none; padding: 40px; background: #fff; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px; box-shadow: 0 20px 40px -10px rgba(0,0,0,0.05);">
                        ${pricingHtml}
                        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #f1f5f9; font-size: 11px; color: #94a3b8; text-align: center; font-style: italic; line-height: 1.6;">
                            ${pkg.content.excluded ? 'Non inclus: ' + pkg.content.excluded.split('\n').join(', ') : 'Tarifs par personne, sujets à disponibilité.'}
                        </div>
                    </div>
                </div>

                <div style="text-align: center; margin-top: 60px; ${avoidBreak}">
                    <div style="width: 40px; height: 3px; background: ${accentColor}; margin: 0 auto 20px auto;"></div>
                    <div style="font-family: sans-serif; color: ${brandColor}; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">NOUBA PLUS - L'ART DE VOYAGER</div>
                </div>
            </div>
        </div>
    `;
  }

  // Options for html2pdf
  const opt = {
    margin: [0, 0, 0, 0], // Remove margins as we control padding in HTML
    filename: `${variant}_package_${pkg.general.productName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
        scale: 2, 
        useCORS: true, 
        letterRendering: true,
        scrollY: 0
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(element).save();
};