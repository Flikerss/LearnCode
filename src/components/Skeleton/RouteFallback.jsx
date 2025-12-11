import { Box, Skeleton, LinearProgress } from "@mui/material";

export default function RouteFallback() {
  return (
    <Box sx={{ p: 3 }} aria-hidden>
      <LinearProgress sx={{ mb: 3 }} />
      <Skeleton variant="text" width={240} />
      <Skeleton variant="rectangular" height={14} width="80%" sx={{ my: 1 }} />
      <Skeleton variant="rectangular" height={14} width="75%" sx={{ my: 1 }} />
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 2,
          mt: 3,
        }}
      >
        {Array.from({ length: 3 }).map((_, i) => (
          <Box key={i} sx={{ p: 2 }}>
            <Skeleton variant="text" width="60%" />
            <Skeleton
              variant="rectangular"
              height={12}
              width="90%"
              sx={{ my: 0.5 }}
            />
            <Skeleton
              variant="rectangular"
              height={12}
              width="85%"
              sx={{ my: 0.5 }}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
}
