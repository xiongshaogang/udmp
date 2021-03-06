package de.koizumi.sleuth.annotation;

import java.lang.reflect.Method;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.Signature;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.aop.support.AopUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.sleuth.Span;
import org.springframework.cloud.sleuth.Tracer;

/** 
 * @description 自定义sleuth的aop类
 * @date 2016年11月2日 下午3:25:45  
*/
@Aspect
public class SleuthSpanCreatorAdvice {

	private SleuthSpanCreator spanCreator;
	private Tracer tracer;

	@Autowired
	public SleuthSpanCreatorAdvice(SleuthSpanCreator spanCreator, Tracer tracer) {
		this.spanCreator = spanCreator;
		this.tracer = tracer;
	}

	@Pointcut("execution(public * *(..))")
	private void anyPublicOperation() {
	}

	@Around("anyPublicOperation()")
	public Object instrumentOnMethodAnnotation(ProceedingJoinPoint pjp) throws Throwable {
		Method method = getMethod(pjp);
		if (method == null) {
			return pjp.proceed();
		}

		Method mostSpecificMethod = AopUtils.getMostSpecificMethod(method, pjp.getTarget().getClass());

		CreateSleuthSpan annotation = SleuthAnnotationUtils.findAnnotation(mostSpecificMethod);

		if (annotation == null) {
			return pjp.proceed();
		}

		Span span = null;
		try {
		    //创建一个sleuth的span，依赖于切面对象和CreateSleuthSpan注解对象
			span = spanCreator.createSpan(pjp, annotation);

			Object retVal = pjp.proceed();

			return retVal;
		} finally {
			if (span != null) {
				tracer.close(span);
			}
		}
	}
	
	private Method getMethod(ProceedingJoinPoint pjp) {
		Signature signature = pjp.getStaticPart().getSignature();

		if (signature instanceof MethodSignature) {
			MethodSignature methodSignature = (MethodSignature) signature;
			Method method = methodSignature.getMethod();

			return method;
		}
		return null;
	}

}
