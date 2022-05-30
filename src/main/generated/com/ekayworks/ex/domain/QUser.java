package com.ekayworks.ex.domain;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QUser is a Querydsl query type for User
 */
@Generated("com.querydsl.codegen.EntitySerializer")
public class QUser extends EntityPathBase<User> {

    private static final long serialVersionUID = -1009370575L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QUser user = new QUser("user");

    public final com.core.epril.entity.QAuditEntity _super;

    public final StringPath address = createString("address");

    //inherited
    public final DateTimePath<java.time.LocalDateTime> created;

    // inherited
    public final QUser createdBy;

    public final StringPath email = createString("email");

    //inherited
    public final NumberPath<Long> id;

    public final StringPath loginId = createString("loginId");

    public final StringPath name = createString("name");

    public final StringPath password = createString("password");

    public final StringPath phone = createString("phone");

    //inherited
    public final DateTimePath<java.time.LocalDateTime> updated;

    // inherited
    public final QUser updatedBy;

    public QUser(String variable) {
        this(User.class, forVariable(variable), INITS);
    }

    public QUser(Path<? extends User> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QUser(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QUser(PathMetadata metadata, PathInits inits) {
        this(User.class, metadata, inits);
    }

    public QUser(Class<? extends User> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this._super = new com.core.epril.entity.QAuditEntity(type, metadata, inits);
        this.created = _super.created;
        this.createdBy = _super.createdBy;
        this.id = _super.id;
        this.updated = _super.updated;
        this.updatedBy = _super.updatedBy;
    }

}

