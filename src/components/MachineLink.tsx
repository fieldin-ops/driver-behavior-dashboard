import { motion } from "framer-motion";

type Props = {
  name: string;
  onSelect: (name: string) => void;
};

export function MachineLink({ name, onSelect }: Props) {
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(name)}
      className="font-medium text-navy underline decoration-navy/30 underline-offset-2 transition-colors hover:text-accent-blue hover:decoration-accent-blue/50"
    >
      {name}
    </motion.button>
  );
}
