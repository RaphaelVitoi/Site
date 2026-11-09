# SOTA R Profile Configuration — Protocolo Chico
local({
  home_dir <- Sys.getenv("USERPROFILE", Sys.getenv("HOME"))
  home_profile <- file.path(home_dir, ".Rprofile")
  this_profile <- normalizePath(".Rprofile", mustWork = FALSE)
  if (nzchar(home_dir) && file.exists(home_profile) && normalizePath(home_profile, mustWork = FALSE) != this_profile) {
    source(home_profile)
  }
  r <- getOption("repos")
  r["CRAN"] <- "https://cloud.r-project.org"
  options(repos = r)
})
