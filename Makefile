.PHONY: clean build deploy-preview deploy-dev deploy-prod dev
clean:
	rm -rf dist

build:
	node scripts/build.mjs

deploy-preview: build
	npx -y vercel@latest deploy --yes --project havesomecode-landing

deploy-dev: deploy-preview

deploy-prod: build
	npx -y vercel@latest deploy --prod --yes --project havesomecode-landing

dev: build
	npx http-server dist