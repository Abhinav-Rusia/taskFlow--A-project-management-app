import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

const TeamMemberList = ({ projectId, isOwner, onMemberRemoved }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/projects/${projectId}`);
      if (response.data.success) {
        const project = response.data.project;
        const teamMembers = project.teamMembers || [];
        // Add owner to the list
        const allMembers = [
          { ...project.owner, role: "owner" },
          ...teamMembers.map((member) => ({ ...member, role: "member" })),
        ];
        setMembers(allMembers);
      }
    } catch (error) {
      console.error("Fetch members error:", error);
      toast.error("Failed to load team members");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId, memberName) => {
    if (!window.confirm(`Remove ${memberName} from this project?`)) return;

    try {
      const response = await axios.delete(`/team/remove/${projectId}/${memberId}`);
      if (response.data.success) {
        toast.success(`${memberName} removed from project`);
        setMembers(members.filter((member) => member._id !== memberId));
        onMemberRemoved?.(memberId);
      }
    } catch (error) {
      console.error("Remove member error:", error);
      toast.error("Failed to remove team member");
    }
  };

  const getInitials = (name) => {
    return name ? name.substring(0, 2).toUpperCase() : "U";
  };

  const getAvatarColor = (userId) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-red-500",
      "bg-yellow-500",
      "bg-teal-500",
    ];
    const index = userId ? userId.length % colors.length : 0;
    return colors[index];
  };

  useEffect(() => {
    if (projectId) {
      fetchTeamMembers();
    }
  }, [projectId]);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mt-1"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Team Members ({members.length})
        </h3>
      </div>

      {members.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            👥
          </div>
          <p>No team members yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {members.map((member) => (
            <div
              key={member._id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                {/* Avatar */}
                <div
                  className={`w-10 h-10 ${getAvatarColor(
                    member._id
                  )} rounded-full flex items-center justify-center text-white font-semibold`}
                >
                  {member.profilePicture &&
                  member.profilePicture !==
                    "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png" ? (
                    <img
                      src={member.profilePicture}
                      alt={member.username}
                      className="w-10 h-10 rounded-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <span
                    className={
                      member.profilePicture &&
                      member.profilePicture !==
                        "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
                        ? "hidden"
                        : ""
                    }
                  >
                    {getInitials(member.username)}
                  </span>
                </div>

                {/* Member Info */}
                <div>
                  <div className="flex items-center space-x-2">
                    <p className="font-medium text-gray-900">
                      {member.username}
                    </p>
                    {member._id === user?.id && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        You
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{member.email}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {/* Role Badge */}
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    member.role === "owner"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {member.role === "owner" ? "Owner" : "Member"}
                </span>

                {/* Remove Button (only for owner and not self) */}
                {isOwner &&
                  member._id !== user?.id &&
                  member.role !== "owner" && (
                    <button
                      onClick={() =>
                        handleRemoveMember(member._id, member.username)
                      }
                      className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors"
                      title="Remove member"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeamMemberList;
