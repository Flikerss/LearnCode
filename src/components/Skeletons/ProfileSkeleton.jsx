import { Box, Grid, Stack } from "@mui/material";
import { Skeleton, SkeletonText } from "./BaseSkeleton.jsx";

export default function ProfileSkeleton() {
  return (
    <Box className="profile-wrapper" sx={{ p: { xs: 2, md: 4 } }} aria-hidden>
      <Box className="profile-header" sx={{ mb: 3 }}>
        <Skeleton height={36} width={160} />
      </Box>
      <Grid container spacing={3} className="profile-main">
        <Grid item xs={12} md={4}>
          <Stack spacing={2}>
            <Skeleton
              height={120}
              width={120}
              sx={{ borderRadius: "50%", alignSelf: "center" }}
            />
            <SkeletonText height={24} width="70%" />
            <SkeletonText height={16} width="60%" />
            <SkeletonText height={16} width="50%" />
            <Stack direction="row" spacing={1} alignItems="center">
              <Skeleton height={28} width={28} sx={{ borderRadius: "50%" }} />
              <SkeletonText height={16} width={80} />
            </Stack>
            <Skeleton height={44} width="100%" />
            <Skeleton height={44} width="80%" />
          </Stack>
        </Grid>
        <Grid item xs={12} md={8}>
          <Stack spacing={3}>
            <Box>
              <SkeletonText height={24} width="40%" />
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {Array.from({ length: 4 }).map((_, index) => (
                  <Grid item xs={6} md={3} key={index}>
                    <Skeleton height={120} />
                  </Grid>
                ))}
              </Grid>
            </Box>
            <Box>
              <SkeletonText height={24} width="45%" />
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                sx={{ mt: 2 }}
              >
                <Skeleton height={20} width="70%" />
                <Skeleton height={32} width={120} />
              </Stack>
            </Box>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
