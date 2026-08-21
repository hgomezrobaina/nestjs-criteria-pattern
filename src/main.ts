import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Express 5 parses the query string with `simple`, which is querystring.parse and
  // does not nest: `order[by]` would arrive as a key literally called "order[by]".
  // `extended` is what plugs in qs.
  app.set("query parser", "extended");

  // Without `transform`, the @Type() decorators of the DTO are not applied and `page`
  // is still a string when it reaches the controller.
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
