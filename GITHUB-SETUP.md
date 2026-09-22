# Connect this site to GitHub later

These commands assume you have created an empty repository on GitHub, for example `krmii-sketchbook`. Run them from this project folder.

## 1. Create the local Git history

```bash
cd /home/krmii/projects/krmii-sketchbook
git init
git add .
git commit -m "Create KRMII sketchbook site"
git branch -M main
```

## 2. Connect the GitHub repository

Replace `YOUR-USERNAME` with your GitHub username:

```bash
git remote add origin https://github.com/YOUR-USERNAME/krmii-sketchbook.git
git push -u origin main
```

If GitHub asks you to sign in, use GitHub CLI (`gh auth login`) or a GitHub personal access token instead of your account password.

## 3. Turn on GitHub Pages

1. Open the repository on GitHub.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Choose branch **main** and folder **/ (root)**.
5. Save. GitHub will show the public site URL after it deploys.

This site is already static-hosting friendly: `index.html` is at the repository root and there is no build command.

## 4. Publish changes later

```bash
git add .
git commit -m "Add a new note"
git push
```

Wait a minute or two for GitHub Pages to redeploy.

## Optional: use your own domain

In **Settings → Pages**, add your custom domain. GitHub will tell you which DNS record to create. When ready, add a file named `CNAME` in this project folder containing only your domain, for example:

```text
notes.example.com
```

Then commit and push that file.
