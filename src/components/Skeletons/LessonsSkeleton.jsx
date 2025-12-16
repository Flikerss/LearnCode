import { Box, Container, Grid, Stack } from "@mui/material";
import { Skeleton, SkeletonText } from "./BaseSkeleton.jsx";

export default function LessonsSkeleton({ variant = "page" }) {
  const content = (
    <Container maxWidth="lg">
      <SkeletonText height={48} width="45%" sx={{ mb: 4 }} />
      <Stack spacing={3}>
        <Skeleton height={120} />
        <Skeleton height={120} />
      </Stack>
      <Box sx={{ mt: 5 }}>
        {Array.from({ length: 3 }).map((_, chapterIdx) => (
          <Box key={chapterIdx} sx={{ mb: 4 }}>
            <SkeletonText height={30} width="30%" />
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {Array.from({ length: 4 }).map((__, cardIdx) => (
                <Grid item xs={12} sm={6} md={3} key={cardIdx}>
                  <Stack spacing={1.5}>
                    <Skeleton height={18} width="70%" />
                    <Skeleton height={12} width="85%" />
                    <Skeleton height={12} width="60%" />
                  </Stack>
                </Grid>
              ))}
            </Grid>
          </Box>
        ))}
      </Box>
    </Container>
  );

  if (variant === "inline") {
    return content;
  }

  return (
    <Box component="main" sx={{ py: 6 }} className="lessons-page" aria-hidden>
      {content}
    </Box>
  );
}
