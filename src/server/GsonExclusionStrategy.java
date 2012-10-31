package server;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import com.google.gson.ExclusionStrategy;
import com.google.gson.FieldAttributes;


public class GsonExclusionStrategy implements ExclusionStrategy {
    private final Class<?> typeToSkip;

    public GsonExclusionStrategy(Class<?> typeToSkip) {
      this.typeToSkip = typeToSkip;
    }

    public boolean shouldSkipClass(Class<?> clazz) {
      return false;
    }

    public boolean shouldSkipField(FieldAttributes f) {
      return f.getAnnotation(noGson.class) != null;
    }
    
    @Retention(RetentionPolicy.RUNTIME)
    @Target({ElementType.FIELD})
    public @interface noGson {
      // Field tag only annotation
    }
}
