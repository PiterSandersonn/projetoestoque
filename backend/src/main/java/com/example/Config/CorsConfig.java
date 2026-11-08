package com.example.Config;

import java.util.Arrays;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuracao =
                new CorsConfiguration();

        configuracao.setAllowedOrigins(
                Arrays.asList(
                        "http://localhost:5173",
                        "http://127.0.0.1:5173"
                )
        );

        configuracao.setAllowedMethods(
                Arrays.asList(
                        "GET",
                        "POST",
                        "PUT",
                        "DELETE",
                        "OPTIONS"
                )
        );

        configuracao.setAllowedHeaders(
                Arrays.asList("*")
        );

        configuracao.setAllowCredentials(false);

        UrlBasedCorsConfigurationSource origem =
                new UrlBasedCorsConfigurationSource();

        origem.registerCorsConfiguration(
                "/**",
                configuracao
        );

        return origem;
    }
}
