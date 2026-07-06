
interface BankLogoProps {
  bank: string;
  className?: string;
}

export function BankLogo({ bank, className = '' }: BankLogoProps) {
  const normalizedBank = (bank || 'Unknown Bank').trim().toUpperCase().replace(/\s+/g, '');
  let bg = '#52525b'; // default fallback dark gray
  let initials = 'BNK';
  let textColor = '#ffffff';

  switch (normalizedBank) {
    case 'SBI':
      bg = '#00a8e8'; // SBI Sky Blue
      initials = 'SBI';
      break;
    case 'HDFC':
      bg = '#1c3f94'; // HDFC Royal Blue
      initials = 'HDFC';
      break;
    case 'ICICI':
      bg = '#7a1a1a'; // ICICI Maroon
      initials = 'ICICI';
      break;
    case 'AXIS':
      bg = '#861f41'; // Axis Burgundy
      initials = 'AXIS';
      break;
    case 'KOTAK':
      bg = '#ea1c24'; // Kotak Red
      initials = 'KOTAK';
      break;
    case 'BOB':
    case 'BANKOFBARODA':
      bg = '#ff6600'; // BOB Orange
      initials = 'BOB';
      break;
    case 'PNB':
    case 'PUNJABNATIONALBANK':
      bg = '#8b0020'; // PNB Red
      initials = 'PNB';
      break;
    case 'IDFC':
    case 'IDFCFIRST':
      bg = '#60000a'; // IDFC Maroon
      initials = 'IDFC';
      break;
    case 'UNION':
    case 'UNIONBANK':
      bg = '#0277bd'; // Union Blue
      initials = 'UBI';
      break;
    case 'IOB':
    case 'INDIANOVERSEASBANK':
      bg = '#00695c'; // IOB Teal
      initials = 'IOB';
      break;
    case 'INDIANBANK':
      bg = '#0d47a1'; // Indian Bank Blue
      initials = 'IND';
      break;
    case 'INDUSIND':
      bg = '#8d1c24'; // IndusInd Rust
      initials = 'IND';
      break;
    case 'YESBANK':
      bg = '#01579b'; // Yes Bank Blue
      initials = 'YES';
      break;
    case 'CANARA':
      bg = '#0091ea'; // Canara Sky Blue
      initials = 'CAN';
      break;
    case 'BOM':
    case 'BANKOFMAHARASHTRA':
      bg = '#0d47a1'; // BOM Navy Blue
      initials = 'BOM';
      break;
    case 'CENTRALBANK':
      bg = '#1565c0'; // CBI Blue
      initials = 'CBI';
      break;
    case 'AU':
      bg = '#4a148c'; // AU Purple
      initials = 'AUB';
      break;
    case 'RBL':
      bg = '#0277bd'; // RBL Blue
      initials = 'RBL';
      break;
    case 'SOUTHINDIAN':
      bg = '#1b5e20'; // SIB Dark Green
      initials = 'SIB';
      break;
    case 'CSB':
      bg = '#0b3c5d'; // CSB Blue
      initials = 'CSB';
      break;
    default:
      // Dynamically extract up to 4 initials from the bank name
      const cleanName = normalizedBank;
      const words = cleanName.split(/[\s_-]+/);
      if (words.length >= 4) {
        initials = (words[0][0] + words[1][0] + words[2][0] + words[3][0]).slice(0, 4);
      } else if (words.length === 3) {
        initials = (words[0][0] + words[1][0] + words[2][0]).slice(0, 3);
      } else if (words.length === 2) {
        initials = (words[0][0] + words[1].slice(0, 2)).slice(0, 3);
      } else {
        initials = cleanName.slice(0, 4);
      }
      break;
  }

  const fontSize = initials.length >= 5
    ? 'text-[8px]'
    : initials.length === 4
    ? 'text-[9px]'
    : 'text-[10px]';

  const tracking = initials.length >= 4 ? 'tracking-normal' : 'tracking-wider';

  return (
    <div
      className={`w-10 h-7 rounded-lg flex items-center justify-center shadow-sm overflow-hidden flex-shrink-0 select-none ${className}`}
      style={{
        backgroundColor: bg,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15)',
      }}
    >
      <span
        className={`font-display font-extrabold leading-none ${fontSize} ${tracking}`}
        style={{ color: textColor }}
      >
        {initials}
      </span>
    </div>
  );
}
