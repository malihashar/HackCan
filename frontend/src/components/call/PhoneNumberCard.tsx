"use client";

type PhoneNumberCardProps = {
  phoneNumber: string;
};

/**
 * Displays the connected phone number in a white card with shadow.
 * Matching Figma reference with rounded-2xl container.
 */
export function PhoneNumberCard({ phoneNumber }: PhoneNumberCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8">
      <div className="text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Connected with</p>
        <p className="text-3xl tracking-wide text-gray-900 dark:text-gray-100">{phoneNumber}</p>
      </div>
    </div>
  );
}
