import { Skeleton as MuiSkeleton } from "@mui/material";
import { styled } from "@mui/material/styles";

export const Skeleton = styled(MuiSkeleton)(({ theme }) => ({
  borderRadius: 12,
  transform: "none",
  backgroundColor:
    theme.palette.mode === "dark"
      ? theme.palette.grey[800]
      : theme.palette.grey[200],
  "&::after": {
    background: `linear-gradient(90deg, transparent, ${
      theme.palette.mode === "dark"
        ? theme.palette.grey[700]
        : theme.palette.grey[100]
    }, transparent)`,
  },
}));

Skeleton.defaultProps = {
  animation: "wave",
  variant: "rectangular",
};

export const SkeletonText = styled(Skeleton)({
  borderRadius: 8,
  transformOrigin: "left center",
});

export const SkeletonCircle = styled(Skeleton)(({ theme }) => ({
  borderRadius: "50%",
  backgroundColor:
    theme.palette.mode === "dark"
      ? theme.palette.grey[800]
      : theme.palette.grey[300],
}));

export const SkeletonContainer = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2),
}));
