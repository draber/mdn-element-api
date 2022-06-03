# GitHub Update Action

1.  `git status` to get latest SHA (local)
2.  `git fetch` to get latest SHA (remote)
3.  `git submodule update --remote`
4.  `git diff --name-changes sha1^ sha2 > $changes` to get changed files
5.  find out if `$changes` contains files under either of the following directories: 
     a) `files/en-us/web/accessibility/aria`
     b) `files/en-us/web/api/globaleventhandlers`
     c) `files/en-us/web/html/element`
     d) `files/en-us/web/html/global_attributes`
     e) `files/en-us/web/math/element`
     f) `files/en-us/web/svg/attribute`
     g) `files/en-us/web/svg/element`
6.  If no, terminate action.
7.  If yes, run the tasks from `./index.js`, but to a tmp directory.
8.  Compare the tmp directory with the current directory.
9.  If they are the same, terminate action.
10. If they are different, validate the changed files.
11. On error, terminate action -> notify.
12. If all is well, overwrite the current directory with the tmp directory.
13. Delete the tmp directory.
14. Commit the changes.
15. Push the changes.