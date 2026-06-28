import { eventTypeBadgeClasses } from "../utils/eventHelpers";

type Props = {
  type: string;
};

export function EventTypeBadge({ type }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${eventTypeBadgeClasses(type)}`}
    >
      {type}
    </span>
  );
}
