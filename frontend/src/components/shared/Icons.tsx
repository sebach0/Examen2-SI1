import {
  Plus,
  Edit,
  Trash2,
  Lock,
  User,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
} from "lucide-react";

// Wrapper components for commonly used action icons
export const AddIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <Plus className={className} />
);

export const EditIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <Edit className={className} />
);

export const DeleteIcon = ({
  className = "w-4 h-4",
}: {
  className?: string;
}) => <Trash2 className={className} />;

export const LockIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <Lock className={className} />
);

export const UserIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <User className={className} />
);

export const SaveIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <Save className={className} />
);

export const CancelIcon = ({
  className = "w-4 h-4",
}: {
  className?: string;
}) => <X className={className} />;

export const AlertIcon = ({
  className = "w-4 h-4",
}: {
  className?: string;
}) => <AlertCircle className={className} />;

export const SuccessIcon = ({
  className = "w-4 h-4",
}: {
  className?: string;
}) => <CheckCircle className={className} />;

export const VisibleIcon = ({
  className = "w-4 h-4",
}: {
  className?: string;
}) => <Eye className={className} />;

export const HiddenIcon = ({
  className = "w-4 h-4",
}: {
  className?: string;
}) => <EyeOff className={className} />;
