package com.core.epril.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QAuditEntity is a Querydsl query type for AuditEntity
 */
@Generated("com.querydsl.codegen.SupertypeSerializer")
public class QAuditEntity extends EntityPathBase<AuditEntity> {

    private static final long serialVersionUID = -250429031L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QAuditEntity auditEntity = new QAuditEntity("auditEntity");

    public final QAbstractEntity _super = new QAbstractEntity(this);

    public final DateTimePath<java.time.LocalDateTime> created = createDateTime("created", java.time.LocalDateTime.class);

    public final com.ekayworks.ex.domain.QUser createdBy;

    //inherited
    public final NumberPath<Long> id = _super.id;

    public final DateTimePath<java.time.LocalDateTime> updated = createDateTime("updated", java.time.LocalDateTime.class);

    public final com.ekayworks.ex.domain.QUser updatedBy;

    public QAuditEntity(String variable) {
        this(AuditEntity.class, forVariable(variable), INITS);
    }

    public QAuditEntity(Path<? extends AuditEntity> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QAuditEntity(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QAuditEntity(PathMetadata metadata, PathInits inits) {
        this(AuditEntity.class, metadata, inits);
    }

    public QAuditEntity(Class<? extends AuditEntity> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.createdBy = inits.isInitialized("createdBy") ? new com.ekayworks.ex.domain.QUser(forProperty("createdBy"), inits.get("createdBy")) : null;
        this.updatedBy = inits.isInitialized("updatedBy") ? new com.ekayworks.ex.domain.QUser(forProperty("updatedBy"), inits.get("updatedBy")) : null;
    }

}

