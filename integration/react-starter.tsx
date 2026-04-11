// src/components/NegativError.tsx
import { useTranslation } from 'react-i18next';
import { NEG_ERROR_CODES } from '@/data/negativ'; // import your JSON files

export default function NegativError({ code }: { code: string }) {
    const { t } = useTranslation();
    const error = NEG_ERROR_CODES[code]; // e.g. NEG-400-validation-required

    if (!error) return null;

    return (
        <div className={error.designSystemIntegrations.tailwind}>
            <h3>{error.title}</h3>
            <p>{t(error.messageKey)}</p>
            {/* Render platform-specific pattern here */}
        </div>
    );
}