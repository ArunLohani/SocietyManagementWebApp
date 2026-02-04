import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, isDevMode, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideToastr } from 'ngx-toastr';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome"
import { credentialInterceptor } from './core/interceptors/credential-interceptor';
import { authInterceptor } from './core/interceptors/auth-interceptor';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { provideServiceWorker } from '@angular/service-worker';
import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache, ApolloLink } from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    // ✅ Single provideHttpClient with your interceptors
    provideHttpClient(withInterceptors([credentialInterceptor, authInterceptor])),
    importProvidersFrom(FontAwesomeModule),
    provideToastr(),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Aura
      }
    }),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    }),
    
    // ✅ Enhanced Apollo GraphQL Configuration
    provideApollo(() => {
      const httpLink = inject(HttpLink);

  
      // 🔗 Create the HTTP link to your Spring Boot GraphQL endpoint
      const http = httpLink.create({
        uri: 'http://localhost:8081/api/v1/graphql', // ✅ Your Spring Boot GraphQL endpoint
      });

      return {
        // ⛓️ Chain all links: error handling → auth → http
        link: ApolloLink.from([http]),
        
        // 💾 Configure cache
        cache: new InMemoryCache({
          typePolicies: {
            Query: {
              fields: {
                // Configure how specific fields should be cached
                getAllUsers: {
                  // Merge pagination results
                  keyArgs: false,
                  merge(existing = { content: [] }, incoming) {
                    return incoming;
                  },
                },
              },
            },
          },
        }),
        
        // ⚙️ Default options for queries and mutations
        defaultOptions: {
          watchQuery: {
            fetchPolicy: 'cache-and-network', // Check cache first, then network
            errorPolicy: 'all',
          },
          query: {
            fetchPolicy: 'network-only', // Always fetch fresh data
            errorPolicy: 'all',
          },
          mutate: {
            errorPolicy: 'all',
          },
        },
      };
    })
  ]
};