import { handleFileUpload, auth } from "./firebase"; // Adjust the path

const AvatarUpload = () => {
  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => handleFileUpload(e, auth.currentUser?.uid)}
      />
    </div>
  );
};

export default AvatarUpload;
