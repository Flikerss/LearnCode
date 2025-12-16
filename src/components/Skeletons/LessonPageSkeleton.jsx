import { Box, Grid, Stack } from "@mui/material";
import { Skeleton, SkeletonText } from "./BaseSkeleton.jsx";

export default function LessonPageSkeleton({ variant = "page" }) {
  const content = (
    <Box
      className="lesson-page"
      aria-hidden
      sx={{
        display: "flex",
        gap: 3,
        py: 4,
        px: { xs: 2, md: 4 },
      }}
    >
      <Box
        component="aside"
        className="lesson-sidebar"
        sx={{ flex: "0 0 280px", display: { xs: "none", md: "block" } }}
      >
        <Stack spacing={3}>
          {Array.from({ length: 3 }).map((_, index) => (
            <Box key={index}>
              <SkeletonText height={24} width="70%" />
              <Stack spacing={1.2} sx={{ mt: 1.5 }}>
                {Array.from({ length: 5 }).map((__, itemIdx) => (
                  <Skeleton
                    key={itemIdx}
                    height={14}
                    width={`${85 - itemIdx * 5}%`}
                  />
                ))}
              </Stack>
            </Box>
          ))}
        </Stack>
      </Box>
      <Box className="lesson-content-wrapper" sx={{ flex: 1 }}>
        <Stack spacing={3}>
          <SkeletonText height={34} width="50%" />
          {Array.from({ length: 2 }).map((_, sectionIdx) => (
            <Box key={sectionIdx}>
              <SkeletonText height={24} width="30%" sx={{ mb: 1 }} />
              <Stack spacing={1.5}>
                {Array.from({ length: 4 }).map((__, lineIdx) => (
                  <Skeleton
                    key={lineIdx}
                    height={16}
                    width={`${90 - lineIdx * 8}%`}
                  />
                ))}
              </Stack>
            </Box>
          ))}
          <Box>
            <SkeletonText height={24} width="38%" sx={{ mb: 1 }} />
            <Skeleton height={280} />
          </Box>
          <Grid container spacing={2} sx={{ pt: 2 }}>
            <Grid item>
              <Skeleton height={42} width={180} />
            </Grid>
            <Grid item>
              <Skeleton height={42} width={200} />
            </Grid>
          </Grid>
        </Stack>
      </Box>
    </Box>
  );

  if (variant === "inline") {
    return content;
  }

  return (
    <Box component="main" aria-hidden>
      {content}
    </Box>
  );
}
