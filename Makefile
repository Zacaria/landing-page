.PHONY: clean
clean:
	rm -rf dist

build:
	cp -r client/. dist

deploy-prod:
	aws s3 sync dist s3://havesomecode-landing-site-bucket--stage-prod

deploy-dev:
	aws s3 sync dist s3://havesomecode-landing-site-bucket--stage-dev --metadata Header-X-Robots-Tag=noindex
dev:
	npx http-server client