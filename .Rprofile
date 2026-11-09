# SOTA R Profile Configuration — Protocolo Chico
local({
  home_dir <- path.expand("~")
  home_profile <- file.path(home_dir, ".Rprofile")
  env_profile <- Sys.getenv("R_PROFILE_USER")
  active_candidate <- if (nzchar(env_profile)) {
    env_profile
  } else if (file.exists(".Rprofile")) {
    ".Rprofile"
  } else {
    home_profile
  }
  this_profile <- normalizePath(active_candidate, mustWork = FALSE)
  norm_home <- normalizePath(home_profile, mustWork = FALSE)
  if (
    !isTRUE(getOption("chico.rprofile.loading")) &&
      nzchar(home_dir) &&
      file.exists(home_profile) &&
      norm_home != this_profile
  ) {
    options(chico.rprofile.loading = TRUE)
    on.exit(options(chico.rprofile.loading = FALSE), add = TRUE)
    source(home_profile)
  }
  r <- getOption("repos")
  r["CRAN"] <- "https://cloud.r-project.org"
  options(repos = r)
})
