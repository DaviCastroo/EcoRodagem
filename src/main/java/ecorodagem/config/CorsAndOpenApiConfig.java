package ecorodagem.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsAndOpenApiConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:4200")
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*");
    }

    @Bean
    public OpenAPI ecoRodagemOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("EcoRodagem REST API")
                        .version("1.0.0")
                        .description("API REST em Spring Boot para gestão de frota pessoal, registro de abastecimentos e cálculo automático de média de consumo (km/L)."));
    }
}
